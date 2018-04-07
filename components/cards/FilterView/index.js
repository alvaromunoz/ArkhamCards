import React from 'react';
import PropTypes from 'prop-types';
import { keys, forEach, filter, map } from 'lodash';
import {
  Text,
  View,
} from 'react-native';
import { connectRealm } from 'react-native-realm';

import { FACTION_CODES } from '../../../constants';
import { applyFilters } from '../../../lib/filters';
import FactionChooser from './FactionChooser';
import TypeChooser from './TypeChooser';
import XpChooser from './XpChooser';
import DefaultFilterState from './DefaultFilterState';
const CARD_FACTION_CODES = [...FACTION_CODES, 'mythos'];

class FilterView extends React.Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    applyFilters: PropTypes.func.isRequired,
    currentFilters: PropTypes.object.isRequired,
    /* eslint-disable  react/no-unused-prop-types */
    baseQuery: PropTypes.string,
    cards: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      filters: props.currentFilters,
      factionCodes: CARD_FACTION_CODES,
      traits: [],
      types: [],
    };

    this._onFactionChange = this.onFactionChange.bind(this);
    this._onTypeChange = this.onTypeChange.bind(this);
    this._applyFilters = this.applyFilters.bind(this);

    props.navigator.setTitle({
      title: 'Filter',
    });
    props.navigator.setButtons({
      rightButtons: [
        {
          title: 'Clear',
          id: 'clear',
        },
      ],
    });
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    const {
      cards,
    } = this.props;
    setTimeout(() => {
      const factionCodes = filter(FACTION_CODES, faction_code =>
        cards.filtered(`faction_code == '${faction_code}'`).length > 0);
      const typesMap = {};
      const traitsMap = {};
      forEach(cards, card => {
        if (card.traits) {
          forEach(
            filter(map(card.traits.split('.'), t => t.trim()), t => t),
            t => {
              traitsMap[t] = 1;
            });
        }
        typesMap[card.type_name] = 1;
      });

      this.setState({
        factionCodes,
        traits: keys(traitsMap).sort(),
        types: keys(typesMap).sort(),
      });
    }, 0);
  }

  applyFilters() {
    this.props.applyFilters(this.state.filters);
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'clear') {
        this.setState({
          filters: DefaultFilterState,
        }, this._applyFilters);
      }
    }
  }

  onFactionChange(selection) {
    this.setState({
      filters: Object.assign({}, this.state.filters, { factions: selection }),
    }, this._applyFilters);
  }

  onTypeChange(selection) {
    this.setState({
      filters: Object.assign({}, this.state.filters, { types: selection }),
    }, this._applyFilters);
  }

  cardCount() {
    const {
      cards,
    } = this.props;
    const query = applyFilters(this.state.filters).join(' and ');
    if (query) {
      return cards.filtered(query).length;
    }
    return cards.length;
  }

  render() {
    const {
      filters: {
        factions,
        types,
      },
      factionCodes,
    } = this.state;

    return (
      <View>
        <FactionChooser
          factions={factionCodes}
          selection={factions}
          onChange={this._onFactionChange}
        />
        <TypeChooser
          onChange={this._onTypeChange}
          selection={types}
        />
        <Text>{ this.cardCount() } Cards Matched</Text>
        <Text> { this.state.types.join(',') }</Text>
      </View>
    );
  }
}

export default connectRealm(FilterView, {
  schemas: ['Card'],
  mapToProps(results, realm, props) {
    return {
      cards: props.baseQuery ? results.cards.filtered(props.baseQuery) : results.cards,
    };
  },
});
