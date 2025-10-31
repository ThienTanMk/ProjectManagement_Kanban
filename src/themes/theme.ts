import { createTheme, MantineColorsTuple } from '@mantine/core';

// ============================================
// MONDAY.COM DARK THEME - MANTINE 8 COMPATIBLE
// Fixed all CSS selector issues for Mantine v8+
// ============================================
export const themeMondayDark = createTheme({
  primaryColor: 'mondayBlue',

  colors: {
    // Monday Blue - Primary brand color
    mondayBlue: [
      '#E6F4FF', // 0
      '#BAE0FF', // 1
      '#91CAFF', // 2
      '#69B1FF', // 3
      '#4C9AFF', // 4
      '#0085FF', // 5 - Hover
      '#0073EA', // 6 - BASE
      '#0060C7', // 7 - Active
      '#004A9E', // 8
      '#003A7A', // 9
    ] as MantineColorsTuple,

    // Monday Purple - Secondary brand
    mondayPurple: [
      '#F3E8FF', // 0
      '#E9D5FF', // 1
      '#D8B4FE', // 2
      '#C084FC', // 3
      '#A25DDC', // 4
      '#8B8BFF', // 5 - Hover
      '#6C6CFF', // 6 - BASE
      '#5555E6', // 7 - Active
      '#4444CC', // 8
      '#3333B3', // 9
    ] as MantineColorsTuple,

    // Success Green
    mondayGreen: [
      '#E6FFED', // 0
      '#B3FFD6', // 1
      '#80FFBF', // 2
      '#4DFFA8', // 3
      '#1AFF91', // 4
      '#00E07D', // 5 - Hover
      '#00CA72', // 6 - BASE
      '#00A35C', // 7 - Active
      '#008049', // 8
      '#006638', // 9
    ] as MantineColorsTuple,

    // Warning Orange
    mondayOrange: [
      '#FFF7E6', // 0
      '#FFE7BA', // 1
      '#FFD68F', // 2
      '#FFC663', // 3
      '#FFB952', // 4 - Hover
      '#FDAB3D', // 5 - BASE
      '#E89A2E', // 6 - Active
      '#D38A21', // 7
      '#BE7A14', // 8
      '#A96A07', // 9
    ] as MantineColorsTuple,

    // Error Red
    mondayRed: [
      '#FFE6E9', // 0
      '#FFCCD3', // 1
      '#FFB3BE', // 2
      '#FF99A8', // 3
      '#F2546D', // 4 - Hover
      '#E44258', // 5 - BASE
      '#D13349', // 6 - Active
      '#BE243B', // 7
      '#AB152D', // 8
      '#98061F', // 9
    ] as MantineColorsTuple,

    // Gray scale
    mondayGray: [
      '#FFFFFF',    // 0
      '#D0D4E4',    // 1
      '#A5A5B7',    // 2
      '#9699A6',    // 3
      '#7E7E8F',    // 4
      '#676879',    // 5
      '#525677',    // 6
      '#454968',    // 7
      '#393D5A',    // 8
      '#2E3350',    // 9
    ] as MantineColorsTuple,

    // Background colors
    mondayBg: [
      '#3A4066',    // 0
      '#323759',    // 1
      '#2B3058',    // 2
      '#252849',    // 3
      '#232749',    // 4
      '#1F2347',    // 5
      '#1E2140',    // 6
      '#1C1F3B',    // 7
      '#181C30',    // 8
      '#151829',    // 9
    ] as MantineColorsTuple,
  },

  white: '#FFFFFF',
  black: '#1C1F3B',
  primaryShade: 6,

  // ============================================
  // COMPONENT STYLES - Mantine 8 Compatible
  // Removed all &[data-*] selectors
  // ============================================
  components: {
    AppShell: {
      styles: {
        root: {
          backgroundColor: '#1C1F3B',
        },
        main: {
          backgroundColor: '#1C1F3B',
          color: '#FFFFFF',
        },
        header: {
          backgroundColor: '#232749',
          borderBottom: '1px solid #393D5A',
          color: '#FFFFFF',
        },
        navbar: {
          backgroundColor: '#181C30',
          borderRight: '1px solid #393D5A',
          color: '#FFFFFF',
        },
      },
    },

    Paper: {
      styles: {
        root: {
          backgroundColor: '#2B3058',
          border: '1px solid #393D5A',
          borderRadius: '8px',
          color: '#FFFFFF',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },

    Card: {
      styles: {
        root: {
          backgroundColor: '#2B3058',
          border: '1px solid #393D5A',
          borderRadius: '8px',
          color: '#FFFFFF',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },

    Modal: {
      styles: {
        content: {
          backgroundColor: '#252849',
          border: '1px solid #393D5A',
          borderRadius: '12px',
          color: '#FFFFFF',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.7)',
        },
        header: {
          backgroundColor: '#252849',
          borderBottom: '1px solid #393D5A',
          color: '#FFFFFF',
        },
        title: {
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '18px',
        },
        close: {
          color: '#9699A6',
        },
      },
    },

    Drawer: {
      styles: {
        content: {
          backgroundColor: '#232749',
          color: '#FFFFFF',
        },
        header: {
          backgroundColor: '#232749',
          borderBottom: '1px solid #393D5A',
          color: '#FFFFFF',
        },
        title: {
          color: '#FFFFFF',
          fontWeight: 700,
        },
      },
    },

    Input: {
      styles: {
        input: {
          backgroundColor: '#1E2140',
          border: '1px solid #393D5A',
          borderRadius: '4px',
          color: '#FFFFFF',
          fontSize: '14px',

          '&::placeholder': {
            color: '#7E7E8F',
          },
        },
        label: {
          color: '#D0D4E4',
          fontWeight: 600,
          fontSize: '14px',
          marginBottom: '4px',
        },
      },
    },

    TextInput: {
      styles: {
        input: {
          backgroundColor: '#1E2140',
          border: '1px solid #393D5A',
          borderRadius: '4px',
          color: '#FFFFFF',
          fontSize: '14px',
        },
      },
    },

    Select: {
      styles: {
        input: {
          backgroundColor: '#1E2140',
          border: '1px solid #393D5A',
          borderRadius: '4px',
          color: '#FFFFFF',
        },
        dropdown: {
          backgroundColor: '#2B3058',
          border: '1px solid #393D5A',
          borderRadius: '8px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
        },
        option: {
          color: '#FFFFFF',
          borderRadius: '4px',
          fontSize: '14px',
        },
      },
    },

    Button: {
      defaultProps: {
        color: 'mondayBlue',
      },
      styles: {
        root: {
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      // ============================================
      // Use variants prop instead of data-variant
      // ============================================
      variants: {
        filled: (theme) => ({
          root: {
            backgroundColor: '#0073EA',
            color: '#FFFFFF',
            border: '1px solid transparent',

            '&:hover': {
              backgroundColor: '#0085FF',
            },
          },
        }),
        outline: (theme) => ({
          root: {
            backgroundColor: 'transparent',
            borderColor: '#393D5A',
            color: '#FFFFFF',

            '&:hover': {
              backgroundColor: '#323759',
            },
          },
        }),
        subtle: (theme) => ({
          root: {
            backgroundColor: 'transparent',
            color: '#D0D4E4',

            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
        }),
        light: (theme) => ({
          root: {
            backgroundColor: '#323759',
            color: '#FFFFFF',

            '&:hover': {
              backgroundColor: '#3A4066',
            },
          },
        }),
      },
    },

    SegmentedControl: {
      styles: {
        root: {
          backgroundColor: '#1E2140',
          border: '1px solid #393D5A',
          borderRadius: '4px',
          padding: '4px',
        },
        indicator: {
          backgroundColor: '#0073EA',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 115, 234, 0.3)',
        },
        label: {
          color: '#9699A6',
          fontWeight: 600,
          fontSize: '14px',
        },
      },
    },

    Badge: {
      styles: {
        root: {
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '12px',
          textTransform: 'none',
        },
      },
      // Use variants instead of data-variant
      variants: {
        light: (theme) => ({
          root: {
            backgroundColor: 'rgba(0, 115, 234, 0.15)',
            color: '#0085FF',
            border: '1px solid rgba(0, 115, 234, 0.3)',
          },
        }),
        filled: (theme) => ({
          root: {
            backgroundColor: '#0073EA',
            color: '#FFFFFF',
            border: '1px solid transparent',
          },
        }),
        outline: (theme) => ({
          root: {
            backgroundColor: 'transparent',
            borderColor: '#393D5A',
            color: '#D0D4E4',
            border: '1px solid #393D5A',
          },
        }),
      },
    },

    Menu: {
      styles: {
        dropdown: {
          backgroundColor: '#2B3058',
          border: '1px solid #393D5A',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
        },
        item: {
          color: '#FFFFFF',
          borderRadius: '4px',
          fontSize: '14px',
          padding: '10px 12px',
        },
        label: {
          color: '#9699A6',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '8px 12px 4px',
        },
        divider: {
          borderColor: '#393D5A',
          margin: '8px 0',
        },
      },
    },

    Text: {
      styles: {
        root: {
          color: '#FFFFFF',
        },
      },
    },

    Title: {
      styles: {
        root: {
          color: '#FFFFFF',
        },
      },
    },

    Divider: {
      styles: {
        root: {
          borderColor: '#393D5A',
        },
      },
    },

    Alert: {
      styles: {
        root: {
          backgroundColor: '#2B3058',
          border: '1px solid #393D5A',
          borderRadius: '8px',
          color: '#FFFFFF',
        },
        title: {
          color: '#FFFFFF',
          fontWeight: 700,
        },
      },
    },

    Avatar: {
      styles: {
        root: {
          border: '2px solid #393D5A',
          backgroundColor: '#323759',
          color: '#FFFFFF',
        },
      },
    },

    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: '#2B3058',
          color: '#FFFFFF',
          border: '1px solid #454968',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 500,
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        },
      },
    },

    Loader: {
      defaultProps: {
        color: 'mondayBlue',
      },
    },

    Table: {
      styles: {
        table: {
          backgroundColor: '#1C1F3B',
          color: '#FFFFFF',
        },
        thead: {
          backgroundColor: '#1F2347',
        },
        th: {
          color: '#D0D4E4',
          fontWeight: 700,
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          padding: '12px 16px',
          borderBottom: '2px solid #393D5A',
        },
        tr: {
          borderBottom: '1px solid #393D5A',
          transition: 'background-color 0.2s ease',

          '&:hover': {
            backgroundColor: '#252849', // Màu hover tối nhẹ
          },
        },
        td: {
          color: '#FFFFFF',
          padding: '12px 16px',
          fontSize: '14px',
        },
      },
    },

    Tabs: {
      styles: {
        root: {
          backgroundColor: 'transparent',
        },
        tab: {
          color: '#9699A6',
          fontWeight: 600,
          fontSize: '14px',
          padding: '12px 16px',
        },
        panel: {
          paddingTop: '16px',
        },
      },
    },

    Checkbox: {
      styles: {
        input: {
          backgroundColor: '#1E2140',
          border: '2px solid #393D5A',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        label: {
          color: '#D0D4E4',
          fontSize: '14px',
        },
      },
    },

    Switch: {
      styles: {
        track: {
          backgroundColor: '#393D5A',
          border: 'none',
          cursor: 'pointer',
        },
        thumb: {
          backgroundColor: '#FFFFFF',
          border: 'none',
        },
        label: {
          color: '#D0D4E4',
          fontSize: '14px',
        },
      },
    },

    Progress: {
      styles: {
        root: {
          backgroundColor: '#2B3058',
          borderRadius: '4px',
        },
        bar: {
          backgroundColor: '#0073EA',
        },
      },
    },

    RingProgress: {
      defaultProps: {
        thickness: 8,
      },
    },

    Notification: {
      styles: {
        root: {
          backgroundColor: '#2B3058',
          border: '1px solid #454968',
          borderRadius: '8px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        },
        title: {
          color: '#FFFFFF',
          fontWeight: 700,
        },
        description: {
          color: '#D0D4E4',
        },
      },
    },
  },
});

// Export as default
export const theme = themeMondayDark;