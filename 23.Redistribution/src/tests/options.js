

export const generateInvalidPhrases = () => {
    const invalidPhrases = [
        't-shirts',
        'sneakers',
        'trouser',
        'shorts',
        'computer',
        'phone',
        'hoody',
        'backpacks'
    ];

    return invalidPhrases[Math.floor(Math.random() * invalidPhrases.length)];
}

export const generateRandomUsername = () => {
    const adjectives = ['happy', 'funny', 'lucky', 'sunny', 'jolly', 'mily', 'nany', 'nasty', 'horny', 'cuty'];
    const nouns = ['user', 'person', 'tester', 'developer', 'customer', 'nury', 'kuly', 'master', 'tearcher', 'creator'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}_${randomNoun}`;
}

export const generateRandomPassword = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}


  