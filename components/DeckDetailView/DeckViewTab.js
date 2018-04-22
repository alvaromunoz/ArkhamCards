import React from 'react';
import PropTypes from 'prop-types';
import { keys, flatMap, map, range, sum } from 'lodash';
import {
  StyleSheet,
  SectionList,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';

import AppIcon from '../../assets/AppIcon';
import { DeckType } from './parseDeck';
import { COLORS } from '../../styles/colors';
import DeckViewCardItem from './DeckViewCardItem';
import DeckValidation from '../../lib/DeckValidation';
import InvestigatorImage from '../core/InvestigatorImage';
import DeckProgressModule from './DeckProgressModule';

function deckToSections(halfDeck) {
  const result = [];
  if (halfDeck.Assets) {
    const assetCount = sum(halfDeck.Assets.map(subAssets =>
      sum(subAssets.data.map(c => c.quantity))));
    result.push({
      title: `Assets (${assetCount})`,
      data: [],
    });
    halfDeck.Assets.forEach(subAssets => {
      result.push({
        subTitle: subAssets.type,
        data: subAssets.data,
      });
    });
  }
  ['Event', 'Skill', 'Treachery', 'Enemy'].forEach(type => {
    if (halfDeck[type]) {
      const count = sum(halfDeck[type].map(c => c.quantity));
      result.push({
        title: `${type} (${count})`,
        data: halfDeck[type],
      });
    }
  });
  return result;
}

const DECK_PROBLEM_MESSAGES = {
  too_few_cards: 'Contains too few cards',
  too_many_cards: 'Contains too many cards',
  too_many_copies: 'Contains too many copies of a card (by title)',
  invalid_cards: 'Contains forbidden cards (cards no permitted by Faction)',
  deck_options_limit: 'Contains too many limited cards',
  investigator: 'Doesn\'t comply with the Investigator requirements',
};

export default class DeckViewTab extends React.Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    parsedDeck: DeckType,
    cards: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this._renderCard = this.renderCard.bind(this);
    this._renderCardHeader = this.renderCardHeader.bind(this);
    this._keyForCard = this.keyForCard.bind(this);
    this._showCard = this.showCard.bind(this);
    this._showInvestigator = this.showInvestigator.bind(this);
  }

  componentDidMount() {
    const {
      navigator,
      parsedDeck,
    } = this.props;
    navigator.setTitle({
      title: parsedDeck.deck.name,
    });
  }

  keyForCard(item) {
    return item.id;
  }

  showInvestigator() {
    const {
      parsedDeck: {
        investigator,
      },
    } = this.props;
    this.showCard(investigator);
  }

  showCard(card) {
    this.props.navigator.push({
      screen: 'Card',
      passProps: {
        id: card.code,
        pack_code: card.pack_code,
      },
    });
  }

  renderCardHeader({ section }) {
    if (section.subTitle) {
      return (
        <View>
          <Text style={styles.subTypeText}>{ section.subTitle }</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.typeText}>{ section.title } </Text>
      </View>
    );
  }

  renderCard({ item }) {
    const card = this.props.cards[item.id];
    if (!card) {
      return null;
    }
    return (
      <DeckViewCardItem
        key={item.id}
        card={card}
        item={item}
        onPress={this._showCard} />
    );
  }

  renderProblem() {
    const {
      cards,
      parsedDeck: {
        slots,
        investigator,
      },
    } = this.props;

    const validator = new DeckValidation(investigator);
    const problem = validator.getProblem(flatMap(keys(slots), code => {
      const card = cards[code];
      return map(range(0, slots[code]), () => card);
    }));

    if (!problem) {
      return null;
    }

    return (
      <View>
        <Text style={styles.problemText}>
          <AppIcon name="warning" size={14} color={COLORS.red} />
          { DECK_PROBLEM_MESSAGES[problem.reason] }
        </Text>
        { problem.problems.map(problem => (
          <Text key={problem} style={styles.problemText}>
            { `\u2022 ${problem}` }
          </Text>
        )) }
      </View>
    );
  }

  render() {
    const {
      navigator,
      parsedDeck: {
        deck,
        normalCards,
        specialCards,
        normalCardCount,
        totalCardCount,
        experience,
        packs,
        investigator,
      },
    } = this.props;

    const sections = deckToSections(normalCards)
      .concat(deckToSections(specialCards));

    return (
      <ScrollView style={styles.container}>
        <View style={styles.rowWrap}>
          <View style={styles.header}>
            <TouchableOpacity onPress={this._showInvestigator}>
              <View style={styles.image}>
                <InvestigatorImage card={investigator} navigator={navigator} />
              </View>
            </TouchableOpacity>
            <View style={styles.metadata}>
              <TouchableOpacity onPress={this._showInvestigator}>
                <Text style={styles.investigatorName}>
                  { investigator.name }
                </Text>
              </TouchableOpacity>
              <Text style={styles.defaultText}>
                { `${normalCardCount} cards (${totalCardCount} total)` }
              </Text>
              <Text style={styles.defaultText}>
                { `${experience} experience required.` }
              </Text>
              <Text style={styles.defaultText}>
                { `${packs} packs required.` }
              </Text>
              { this.renderProblem() }
            </View>
          </View>
        </View>
        <SectionList
          initialNumToRender={20}
          renderItem={this._renderCard}
          keyExtractor={this._keyForCard}
          renderSectionHeader={this._renderCardHeader}
          sections={sections}
        />
        <DeckProgressModule navigator={navigator} deck={deck} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'column',
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 8,
  },
  investigatorName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    marginLeft: 8,
    marginRight: 8,
  },
  defaultText: {
    color: '#000000',
    fontSize: 14,
  },
  problemText: {
    color: COLORS.red,
    fontSize: 14,
  },
  typeText: {
    color: '#000000',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 6,
  },
  subTypeText: {
    marginTop: 4,
    color: '#646464',
    fontSize: 14,
    fontWeight: '200',
    borderBottomColor: '#0A0A0A',
    borderBottomWidth: 1,
  },
});