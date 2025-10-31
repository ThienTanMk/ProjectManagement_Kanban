"use client";
import { useEffect, useState } from "react";
import { Select } from "@mantine/core";

const themes = [
  { value: "light", label: "🌤 Light" },
  { value: "dev", label: "💻 Dev Mode" },
  { value: "dark", label: "🌙 Dark" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const handleChange = (value: string | null) => {
    if (!value) return;
    setTheme(value);
    document.body.setAttribute("data-theme", value);
    localStorage.setItem("theme", value);
  };

  return (
    <Select
      value={theme}
      onChange={handleChange}
      data={themes}
      size="xs"
      w={140}
      label="Theme"
    />
  );
}
