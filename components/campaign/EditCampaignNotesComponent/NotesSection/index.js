import React from 'react';
import PropTypes from 'prop-types';
import { filter, map } from 'lodash';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import NoteRow from './NoteRow';
import typography from '../../../../styles/typography';

export default class NotesSection extends React.Component {
  static propTypes = {
    notesChanged: PropTypes.func.isRequired,
    index: PropTypes.number,
    title: PropTypes.string.isRequired,
    notes: PropTypes.array,
    isInvestigator: PropTypes.bool,
    showDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      notes: [...props.notes, ''],
    };

    this._syncNotes = this.syncNotes.bind(this);
    this._updateNote = this.updateNote.bind(this);
  }

  syncNotes() {
    const {
      notesChanged,
      index,
    } = this.props;
    const {
      notes,
    } = this.state;
    notesChanged(index, filter(notes, note => note !== ''));
  }

  updateNote(index, note) {
    let notes = this.state.notes.slice();
    notes[index] = note;
    if (note === '') {
      notes = filter(notes, note => note !== '');
      notes.push('');
    } else if (index === (notes.length - 1)) {
      // If they add something to last one, grow it.
      notes.push('');
    }
    this.setState({
      notes,
    }, this._syncNotes);
  }

  render() {
    const {
      title,
      isInvestigator,
      showDialog,
    } = this.props;
    const {
      notes,
    } = this.state;
    return (
      <View style={isInvestigator ? {} : styles.container}>
        <Text style={[typography.smallLabel, styles.margin]}>
          { title.toUpperCase() }
        </Text>
        <View>
          { map(notes, (note, idx) => (
            <NoteRow
              key={`${idx}-${note}`}
              title={title}
              index={idx}
              note={note}
              updateNote={this._updateNote}
              last={idx === (this.state.notes.length - 1)}
              showDialog={showDialog}
            />)
          ) }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  margin: {
    marginTop: 4,
  },
});
