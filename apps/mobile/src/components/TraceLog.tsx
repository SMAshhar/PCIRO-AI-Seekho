import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors, typography} from '../constants/theme';

interface Props {
  content: string;
  maxLines?: number;
}

export const TraceLog: React.FC<Props> = ({content, maxLines = 20}) => {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split('\n');
  const showMore = lines.length > maxLines && !expanded;

  const display = expanded ? content : lines.slice(0, maxLines).join('\n');

  return (
    <View style={styles.container}>
      <ScrollView horizontal nestedScrollEnabled>
        <ScrollView style={{maxHeight: expanded ? 400 : 260}} nestedScrollEnabled>
          <Text style={typography.trace}>{display}</Text>
        </ScrollView>
      </ScrollView>
      {showMore && (
        <TouchableOpacity onPress={() => setExpanded(true)}>
          <Text style={styles.more}>Show more</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.void,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  more: {...typography.label, color: colors.blue, marginTop: 8},
});
