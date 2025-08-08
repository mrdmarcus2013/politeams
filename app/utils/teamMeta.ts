// app/utils/teamMeta.ts

export const teamMeta: Record<
  string,
  {
    nickname: string;
    logo: string;
    colors: {
      primary: string;
      secondary: string;
      alternate: string;
      backgroundColor: string;
      textColor: string;
    };
  }
> = {
  left: {
    nickname: "Kraken",
    logo: "/team-logos/krakentsp.png",
    colors: {
      primary: "#00ff00ff",        // Lime Green
      secondary: "#FF00FF",      // Magenta
      alternate: "#00BFFF",      // Deep Sky Blue
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  right: {
    nickname: "Bulwark",
    logo: "/team-logos/bulwarktsp.png",
    colors: {
      primary: "#FF0033",        // Neon Red
      secondary: "#FFCC00",      // Bright Yellow
      alternate: "#FF6600",      // Vivid Orange
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  center: {
    nickname: "Navigators",
    logo: "/team-logos/navigatorstsp.png",
    colors: {
      primary: "#00FFCC",        // Aqua Mint
      secondary: "#3366FF",      // Bright Blue
      alternate: "#66FF66",      // Neon Green
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  progressive: {
    nickname: "Blazers",
    logo: "/team-logos/blazerstsp.png",
    colors: {
      primary: "#FF3399",        // Hot Pink
      secondary: "#FF6600",      // Orange
      alternate: "#FFD700",      // Gold
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  libertarian: {
    nickname: "Free Riders",
    logo: "/team-logos/freeriderstsp.png",
    colors: {
      primary: "#A020F0",        // Purple
      secondary: "#D8DBDE",      // Chrome
      alternate: "#FFCCFF",      // Light Pink
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  environmentalist: {
    nickname: "Guardians",
    logo: "/team-logos/guardianstsp.png",
    colors: {
      primary: "#00ff2fce",        // Lime
      secondary: "#00CED1",      // Dark Turquoise
      alternate: "#32CD32",      // Lime Green
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  technocrat: {
    nickname: "Cyborgs",
    logo: "/team-logos/cyborgstsp.png",
    colors: {
      primary: "#33CCFF",        // Electric Blue
      secondary: "#FF00FF",      // Magenta
      alternate: "#00FF99",      // Mint Green
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
  anarchist: {
    nickname: "Marauders",
    logo: "/team-logos/marauderstsp.png",
    colors: {
      primary: "#FF0000",        // Bright Red
      secondary: "#FFA500",      // Neon Orange
      alternate: "#FFFF00",      // Yellow
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
    },
  },
};
