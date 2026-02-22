use std::path::Path;
use std::sync::OnceLock;

use ratatui::{
    style::{Color, Modifier, Style},
    text::{Line, Span},
};
use syntect::easy::HighlightLines;
use syntect::highlighting::{FontStyle, Theme as SyntectTheme, ThemeSet};
use syntect::parsing::{SyntaxReference, SyntaxSet};
use unicode_width::UnicodeWidthChar;

use crate::ui::file_viewer::FileKind;

use super::{text_primary, RawEventEntry};

pub fn highlight_source_lines(
    file_kind: FileKind,
    file_path: &Path,
    lines: &[String],
) -> Vec<Line<'static>> {
    match highlight_with_syntect(file_kind, file_path, lines) {
        Some(highlighted) => highlighted,
        None => lines
            .iter()
            .map(|line| Line::from(fallback_highlight_line(file_kind, line)))
            .collect(),
    }
}

pub fn truncate_spans_with_ellipsis(
    spans: &[Span<'static>],
    max_width: usize,
) -> Vec<Span<'static>> {
    if max_width == 0 {
        return Vec::new();
    }

    let (full, truncated) = collect_spans_to_width(spans, max_width);
    if !truncated {
        return full;
    }

    if max_width == 1 {
        return vec![Span::styled("…", Style::default().fg(text_primary()))];
    }

    let (mut clipped, _) = collect_spans_to_width(spans, max_width.saturating_sub(1));
    push_char_with_style(&mut clipped, '…', Style::default().fg(text_primary()));
    clipped
}

fn highlight_with_syntect(
    file_kind: FileKind,
    file_path: &Path,
    lines: &[String],
) -> Option<Vec<Line<'static>>> {
    let syntax_set = syntax_set();
    let syntax = resolve_syntax(file_kind, file_path, syntax_set);
    let mut highlighter = HighlightLines::new(syntax, theme());

    let mut highlighted = Vec::with_capacity(lines.len());
    for line in lines {
        let mut with_newline = String::with_capacity(line.len() + 1);
        with_newline.push_str(line);
        with_newline.push('\n');

        let ranges = highlighter.highlight_line(&with_newline, syntax_set).ok()?;
        let mut spans = Vec::new();
        for (style, text) in ranges {
            let text = text.strip_suffix('\n').unwrap_or(text);
            if text.is_empty() {
                continue;
            }
            spans.push(Span::styled(text.to_string(), style_to_ratatui(style)));
        }

        if spans.is_empty() {
            highlighted.push(Line::from(""));
        } else {
            highlighted.push(Line::from(spans));
        }
    }

    Some(highlighted)
}

fn syntax_set() -> &'static SyntaxSet {
    static SYNTAX_SET: OnceLock<SyntaxSet> = OnceLock::new();
    SYNTAX_SET.get_or_init(SyntaxSet::load_defaults_newlines)
}

fn theme_set() -> &'static ThemeSet {
    static THEME_SET: OnceLock<ThemeSet> = OnceLock::new();
    THEME_SET.get_or_init(ThemeSet::load_defaults)
}

fn theme() -> &'static SyntectTheme {
    let themes = theme_set();
    themes
        .themes
        .get("base16-ocean.dark")
        .or_else(|| themes.themes.get("InspiredGitHub"))
        .or_else(|| themes.themes.values().next())
        .expect("syntect theme set has no themes")
}

fn resolve_syntax<'a>(
    file_kind: FileKind,
    file_path: &Path,
    syntax_set: &'a SyntaxSet,
) -> &'a SyntaxReference {
    if let Some(ext) = file_path.extension().and_then(|ext| ext.to_str()) {
        if let Some(syntax) = syntax_set.find_syntax_by_extension(ext) {
            return syntax;
        }
    }

    let by_name = match file_kind {
        FileKind::Markdown => syntax_set.find_syntax_by_name("Markdown"),
        FileKind::Json => syntax_set.find_syntax_by_name("JSON"),
        FileKind::Rust => syntax_set.find_syntax_by_name("Rust"),
        FileKind::Toml => syntax_set.find_syntax_by_name("TOML"),
        FileKind::Yaml => syntax_set.find_syntax_by_name("YAML"),
        FileKind::PlainText => None,
    };

    by_name.unwrap_or_else(|| syntax_set.find_syntax_plain_text())
}

fn style_to_ratatui(style: syntect::highlighting::Style) -> Style {
    let mut mapped = Style::default().fg(Color::Rgb(
        style.foreground.r,
        style.foreground.g,
        style.foreground.b,
    ));

    if style.font_style.contains(FontStyle::BOLD) {
        mapped = mapped.add_modifier(Modifier::BOLD);
    }
    if style.font_style.contains(FontStyle::ITALIC) {
        mapped = mapped.add_modifier(Modifier::ITALIC);
    }
    if style.font_style.contains(FontStyle::UNDERLINE) {
        mapped = mapped.add_modifier(Modifier::UNDERLINED);
    }

    mapped
}

fn fallback_highlight_line(file_kind: FileKind, line: &str) -> Vec<Span<'static>> {
    match file_kind {
        FileKind::Json => RawEventEntry::highlight_json_line(line),
        _ => vec![Span::styled(
            line.to_string(),
            Style::default().fg(text_primary()),
        )],
    }
}

fn collect_spans_to_width(spans: &[Span<'static>], max_width: usize) -> (Vec<Span<'static>>, bool) {
    let mut out = Vec::new();
    let mut width = 0usize;

    for span in spans {
        for ch in span.content.chars() {
            let ch_width = UnicodeWidthChar::width(ch).unwrap_or(0);
            if width + ch_width > max_width {
                return (out, true);
            }
            push_char_with_style(&mut out, ch, span.style);
            width += ch_width;
        }
    }

    (out, false)
}

fn push_char_with_style(spans: &mut Vec<Span<'static>>, ch: char, style: Style) {
    if let Some(last) = spans.last_mut() {
        if last.style == style {
            last.content.to_mut().push(ch);
            return;
        }
    }

    spans.push(Span::styled(ch.to_string(), style));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_highlight_source_lines_json_returns_styled_segments() {
        let lines = vec!["{\"key\": true, \"n\": 1}".to_string()];
        let highlighted = highlight_source_lines(FileKind::Json, Path::new("sample.json"), &lines);

        assert_eq!(highlighted.len(), 1);
        assert!(!highlighted[0].spans.is_empty());
        assert!(highlighted[0].spans.len() > 1);
    }

    #[test]
    fn test_highlight_source_lines_rust_returns_styled_segments() {
        let lines = vec!["pub fn main() { let x = 1; }".to_string()];
        let highlighted = highlight_source_lines(FileKind::Rust, Path::new("main.rs"), &lines);

        assert_eq!(highlighted.len(), 1);
        assert!(!highlighted[0].spans.is_empty());
    }

    #[test]
    fn test_truncate_spans_adds_ellipsis() {
        let spans = vec![Span::styled(
            "very-long-content".to_string(),
            Style::default().fg(text_primary()),
        )];
        let truncated = truncate_spans_with_ellipsis(&spans, 6);
        let text: String = truncated.iter().map(|s| s.content.as_ref()).collect();
        assert!(text.ends_with('…'));
    }
}
