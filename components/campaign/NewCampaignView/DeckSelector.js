import listOfDecks from '../listOfDecks';
import deckRowWithDetails from '../deckRowWithDetails';

export default listOfDecks(
  deckRowWithDetails(
    null,
    null, {
      compact: false,
      viewDeckButton: false,
    },
  )
);
