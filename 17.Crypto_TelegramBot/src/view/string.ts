const startText = "Hi, this TelegramBot help you to managing crypto coins";
const helpText =
`
/start - begin chating and retrun welcome message;
/help - return short message with all commands and  their describe what they do;
/listRecent - return list with the price most popular 30 crypto coins;
/{currency_symbol} - return detail info about crypto coins;
/addToFavourite {currency_symbol} - add crypto to the list of favourite;
/listFavorite - back your list of favourite;
/deleteFavourite {currency_symbol} - delete crypto from list of favourite;
`
const addText = 'Data was added';
const deleteText = 'Data was deleted';
const emptyListText = 'List is empty';
const existAddText = 'The coin has already exist in the list of favourite';
const existDeleteText = "The coin doesn't exist in the list of favourite";
const invalidCommandText = 'Invalid command';
const coinExistText = "The coin isn't supporteв by bot";

export { startText, helpText, addText,
    deleteText, emptyListText, coinExistText,
    invalidCommandText, existAddText, existDeleteText
}