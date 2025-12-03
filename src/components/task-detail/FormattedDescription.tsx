"use client";
import { useMemo } from "react";
import { Stack, Text, Paper, List, Box } from "@mantine/core";

interface FormattedDescriptionProps {
  description: string;
}

interface ParsedSection {
  title: string;
  content: string[];
  type: "text" | "list";
}

const SECTION_COLORS: Record<string, string> = {
  OBJECTIVE: "#4c6ef5",
  DELIVERABLES: "#228be6",
  IMPLEMENTATION: "#15aabf",
  "TECHNICAL REQUIREMENTS": "#12b886",
  "ACCEPTANCE CRITERIA": "#40c057",
  WHY: "#fab005",
  HOW: "#fd7e14",
  "TECHNICAL DETAILS": "#f06595",
};

export function FormattedDescription({
  description,
}: FormattedDescriptionProps) {
  const sections = useMemo(() => {
    if (!description) return null;

    // Check if description has structured format
    const hasStructuredFormat = /^[A-Z\s]+:/m.test(description);

    if (!hasStructuredFormat) {
      // Return plain text for unstructured descriptions
      return null;
    }

    const parsed: ParsedSection[] = [];
    const lines = description.split("\n");
    let currentSection: ParsedSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) continue;

      // Check if it's a section header (all caps followed by colon)
      const sectionMatch = trimmedLine.match(/^([A-Z\s]+):\s*(.*)$/);

      if (sectionMatch) {
        // Save previous section if exists
        if (currentSection) {
          parsed.push(currentSection);
        }

        // Start new section
        const title = sectionMatch[1].trim();
        const firstContent = sectionMatch[2].trim();

        currentSection = {
          title,
          content: firstContent ? [firstContent] : [],
          type: "text",
        };
      } else if (currentSection) {
        // Check if it's a list item (starts with -, •, or number)
        const isListItem = /^[-•\d.]\s/.test(trimmedLine);

        if (isListItem) {
          currentSection.type = "list";
          // Remove the bullet/number prefix
          const content = trimmedLine.replace(/^[-•\d.]\s+/, "");
          currentSection.content.push(content);
        } else {
          // Regular text content
          currentSection.content.push(trimmedLine);
        }
      }
    }

    // Add the last section
    if (currentSection) {
      parsed.push(currentSection);
    }

    return parsed.length > 0 ? parsed : null;
  }, [description]);

  // If no structured format, render plain text
  if (!sections) {
    return (
      <Text c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
        {description}
      </Text>
    );
  }

  // Render structured format
  return (
    <Stack gap="md">
      {sections.map((section, idx) => (
        <Paper
          key={idx}
          p="md"
          withBorder
          style={{
            borderLeft: `4px solid ${
              SECTION_COLORS[section.title] || "#868e96"
            }`,
          }}
        >
          <Stack gap="xs">
            <Text
              fw={600}
              size="sm"
              tt="uppercase"
              c={SECTION_COLORS[section.title] || "gray"}
            >
              {section.title}
            </Text>

            {section.type === "list" ? (
              <List size="sm" spacing="xs">
                {section.content.map((item, itemIdx) => (
                  <List.Item key={itemIdx}>
                    <Text size="sm">{item}</Text>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Box>
                {section.content.map((text, textIdx) => (
                  <Text
                    key={textIdx}
                    size="sm"
                    mb={textIdx < section.content.length - 1 ? "xs" : 0}
                  >
                    {text}
                  </Text>
                ))}
              </Box>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
