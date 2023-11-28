function caesarDecipher(ciphertext, key) {
    // Create a string of all characters on a keyboard
    const keyboardChars = [...Array(127).keys()]
      .map((i) => String.fromCharCode(i))
      .join('');
  
    // Shuffle the keyboard characters based on the key as a seed
    const shuffledChars = shuffleString(keyboardChars, key);
  
    // Create a mapping of shuffled characters to their original counterparts
    const mapping = Object.fromEntries(
      [...shuffledChars].map((char, index) => [char, keyboardChars[index]])
    );
  
    // Decrypt the ciphertext
    let decryptedText = '';
    for (let char of ciphertext) {
      if (mapping.hasOwnProperty(char)) {
        decryptedText += mapping[char];
      } else {
        decryptedText += char;
      }
    }
  
    return decryptedText;
  }

        function caesarCipher(text, key) {
    // Create a string of all characters on a keyboard
    const keyboardChars = [...Array(127).keys()]
      .map((i) => String.fromCharCode(i))
      .join('');
  
    // Shuffle the keyboard characters based on the key as a seed
    const shuffledChars = shuffleString(keyboardChars, key);
  
    // Create a mapping of characters to their shuffled counterparts
    const mapping = Object.fromEntries(
      [...keyboardChars].map((char, index) => [char, shuffledChars[index]])
    );
  
    // Encrypt the text
    let encryptedText = '';
    for (let char of text) {
      if (mapping.hasOwnProperty(char)) {
        encryptedText += mapping[char];
      } else {
        encryptedText += char;
      }
    }
  
    return encryptedText;
  }

  
  function shuffleString(str, key) {
    const chars = str.split('');
    const seed = createSeed(key);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(seed() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }
  
      function createSeed(key) {
      let currentSeed = key;
      return function () {
          currentSeed = (currentSeed * 9301 + 49297) % 233280;
          return currentSeed / 233280;
      };
      }

      function replaceWordsWithAsterisks(message, words) {
        // Convert message and words to lowercase
        const lowercasedMessage = message.toLowerCase();
        const lowercasedWords = words.map((word) => word.toLowerCase());
      
        // Replace words with asterisks
        let censoredMessage = lowercasedMessage;
        lowercasedWords.forEach((word) => {
          const asterisks = '*'.repeat(word.length);
          censoredMessage = censoredMessage.replace(new RegExp(word, 'g'), asterisks);
        });
      
        return censoredMessage;
      }
      
  
                          

        export {caesarDecipher, caesarCipher, replaceWordsWithAsterisks}