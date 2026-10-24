import { Fragment, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatAr } from "@/utils/format";

export interface PieSlice {
  key: string;
  label: string;
  value: number;
  pct: number;
}

/** Palette du graphique : contraste suffisant entre deux parts voisines. */
export const PIE_PALETTE = [
  "#1557A6",
  "#20B26B",
  "#F2A93B",
  "#E05252",
  "#2F80ED",
  "#7B61FF",
  "#00A6A6",
  "#B4708C",
] as const;

const SIZE = 188;
const PLANE_HEIGHT = SIZE / 2;

/**
 * Un secteur du disque, découpé par deux demi-disques rognés.
 * Un « plan » est un rectangle de SIZE×SIZE/2 dont les deux coins du haut sont
 * totalement arrondis : c'est exactement un demi-disque de diamètre SIZE. Placé
 * au-dessus du centre du disque puis pivoté sur son milieu bas (le centre du
 * disque), il ne garde que la moitié du disque située dans le secteur voulu ;
 * l'intersection des deux plans donne le secteur final. Un secteur de plus de
 * 180° est découpé en deux.
 *
 * Les angles sont en heures : 0 = midi, sens horaire.
 */
function Sector({ color, from, to }: { color: string; from: number; to: number }) {
  const span = to - from;
  if (span <= 0) return null;
  if (span >= 359.9) return <View style={[styles.fill, { backgroundColor: color }]} />;

  const parts = span > 180 ? [[from, from + 180], [to - 180, to]] : [[from, to]];

  return (
    <>
      {parts.map(([start, end], index) => (
        <Fragment key={index}>
          <View
            style={[
              styles.plane,
              { transform: [{ rotate: `${start + 90}deg` }] },
            ]}
          >
            <View
              style={[
                styles.plane,
                { transform: [{ rotate: `${end - 90}deg` }] },
              ]}
            >
              <View style={[styles.fill, { backgroundColor: color }]} />
            </View>
          </View>
        </Fragment>
      ))}
    </>
  );
}

interface PieChartProps {
  slices: PieSlice[];
  /** Message affiché quand il n'y a rien à représenter. */
  emptyLabel?: string;
}

/** Diagramme circulaire (parts pleines) + légende détaillée. */
export function PieChart({ slices, emptyLabel = "Aucune donnée à représenter." }: PieChartProps) {
  const theme = useTheme();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const segments = useMemo(
    () =>
      slices.map((slice, index) => {
        const from = slices
          .slice(0, index)
          .reduce((sum, previous) => sum + previous.value, 0);
        return {
          slice,
          color: PIE_PALETTE[index % PIE_PALETTE.length],
          from,
          to: from + (slice.value / total) * 360,
        };
      }),
    [slices, total]
  );

  if (total <= 0) {
    return (
      <View style={[styles.card, styles.cardEmpty, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.empty, { color: theme.textSecondary }]}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, Shadows.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.body}>
        <View style={[styles.disc, { backgroundColor: segments[0].color }]}>
          {segments.map((segment) => (
            <Sector
              key={segment.slice.key}
              color={segment.color}
              from={segment.from}
              to={segment.to}
            />
          ))}
        </View>

        <View style={styles.legend}>
          {segments.map((segment) => (
            <View key={segment.slice.key} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text style={[styles.legendLabel, { color: theme.text }]} numberOfLines={1}>
                {segment.slice.label}
              </Text>
              <Text style={[styles.legendPct, { color: theme.textSecondary }]}>
                {segment.slice.pct} %
              </Text>
              <Text style={[styles.legendValue, { color: theme.text }]} numberOfLines={1}>
                {formatAr(segment.slice.value)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.three,
  },
  cardEmpty: {
    alignItems: "center",
    paddingVertical: Spacing.four,
  },
  empty: {
    fontSize: 13,
  },
  body: {
    alignItems: "center",
    gap: Spacing.three,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
  },
  plane: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: PLANE_HEIGHT,
    borderTopLeftRadius: SIZE / 2,
    borderTopRightRadius: SIZE / 2,
    transformOrigin: ["50%", "100%", 0],
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
  },
  legend: {
    alignSelf: "stretch",
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  legendPct: {
    fontSize: 13,
    fontWeight: "700",
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 84,
    textAlign: "right",
  },
});
