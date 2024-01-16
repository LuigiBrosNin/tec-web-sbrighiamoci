
export let top_10_words = [];            // coppia (parola, frequenza) delle 10 parole piu' usate 
export let average_text = -1;            // lunghezza media degli squeals
export let average_impressions = [];     // media del numero di impressions negli unltimi 12 mesi (visualizzazioni)
export let average_comments = [];        // media del numero dei commenti negli ultimi 12 mesi
export let average_pos_reactions = [];   // media del numero delle reazioni positive negli ultimi 12 mesi 
export let average_neg_reactions = [];   // media del numero delle reazioni negative negli ultimi 12 mesi 
export let tot_average_impressions = -1;
export let tot_average_comments = -1;

//#####################   FUNZIONI   #####################//

// recupero di tutti gli squeal del profilo e chiamata a funzione che calcola metriche
export async function fetchData(profile_name) {
  try {
    let squeals = [] // lista di tutti gli squeal pubblici di un profilo
    let no_more_squeals = false;
    let start_index = 0, end_index = 9, page_dim = 10;

    while (!no_more_squeals) {
      const response = await fetch(`https://site222326.tw.cs.unibo.it/squeals?author=${profile_name}&startindex=${start_index}&endindex=${end_index}`, {
        method: "GET"
      });
      const newSqueals = await response.json();

      start_index += page_dim;
      end_index += page_dim;

      if (newSqueals.length === 0 || newSqueals.length < 10) {
        no_more_squeals = true;
      }
      squeals = squeals.concat(newSqueals);  // concatena i nuovi squeals alla lista precedente
    }
    calculateAverages(squeals)  // dopo aver scaricato tutti gli squeal calcolo le varie medie

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function calculateAverages(squeals_list) {

  //* Metriche per profile insights

  // parole piu' usate
  top_10_words = mostUsedWords(squeals_list)

  // media del numero di parole contenute in uno squeal
  average_text = averageText(squeals_list)

  // media impressions e commenti
  average_impressions = averageImpressions(squeals_list)
  average_comments    = averageComments(squeals_list)

  // media delle positive/negative reactions
  average_pos_reactions = averagePositiveReactions(squeals_list)
  average_neg_reactions = averageNegativeReactions(squeals_list)

  //* Metriche per squeal insights
  // media totale (indipendente dal tempo) di impressions e commenti
  tot_average_impressions = totAverageImpressions(squeals_list)
  tot_average_comments = totAverageComments(squeals_list)
}

// calcola lunghezza media degli squeal data una lista di squeal
function averageText(squeals_list) {
  let word_count = 0;

  squeals_list.forEach((squeal) => {
    const words_list = squeal.text.split(/\s+/); // crea lista delle singole parole usando spazi come delimitatori
    const filteredWords = words_list.filter((word) => word.length > 2); // filtra parole con lunghezza > 2
    word_count += filteredWords.length; 
  });

  return word_count / squeals_list.length;
}

// calcola 10 coppie [parola, frequenza] (> 2 caratteri) piu' frequenti in una lista di squeal
function mostUsedWords(squeals_list) {
  const word_frequencies = {};

  squeals_list.forEach((squeal) => {
    const words = squeal.text.split(/\s+/); // divide testo in parole
    const filtered_words = words.filter((word) => word.length > 2);  // prendo quelle piu' lunghe di 2

    filtered_words.forEach((word) => {
      if (word in word_frequencies) {
        word_frequencies[word]++;
      } else {
        word_frequencies[word] = 1;
      }
    });
  });

  const word_freq_array = Object.entries(word_frequencies); // conversione dizionario in array di coppie [parola, frequenza]
  const sorted_word_freq = word_freq_array.sort((a, b) => b[1] - a[1]);  // ordina array con frequenza decrescente
  const top_words = sorted_word_freq.slice(0, 10)
  
  return top_words;
}

// ritorna array di 12 elementi, ad ogni mese la media di impressions di quel mese
function averageImpressions(squeals_list) {
  if (!squeals_list || squeals_list.length === 0) {
    return []; 
  }

  // creo array per tenere traccia delle somme e del numero di squeal per ogni mese
  const monthly_stats = [];
  for (let i = 0; i < 12; i++) {
    monthly_stats.push({ sum: 0, count: 0 });
  }

  squeals_list.forEach((squeal) => {
    const date = new Date(squeal.date);
    const month = date.getMonth();

    monthly_stats[month].sum += squeal.impressions;
    monthly_stats[month].count += 1;
  });

  // calcola media per ogni mese
  const averages = monthly_stats.map(({ sum, count }) => (count === 0 ? 0 : sum / count));
  return averages;
}

// ritorna array di 12 elementi, ad ogni mese la media del numero dei commenti di quel mese
function averageComments(squeals_list) {
  if (!squeals_list || squeals_list.length === 0) {
    return [];
  }

  // creo array per tenere traccia delle somme e del numero di squeal per ogni mese
  const monthly_stats = [];
  for (let i = 0; i < 12; i++) {
    monthly_stats.push({ sum: 0, count: 0 });
  }

  squeals_list.forEach((squeal) => {
    const date = new Date(squeal.date);
    const month = date.getMonth();

    monthly_stats[month].sum += squeal.replies.length;
    monthly_stats[month].count += 1;
  });

  // calcola media per ogni mese
  const averages = monthly_stats.map(({ sum, count }) => (count === 0 ? 0 : sum / count));
  return averages;
}

// ritorna array di 12 elementi, ad ogni mese la media del numero delle positive reactions di quel mese
function averagePositiveReactions(squeals_list) {
  if (!squeals_list || squeals_list.length === 0) {
    return [];
  }

  // creo array per tenere traccia delle somme e del numero di squeal per ogni mese
  const monthly_stats = [];
  for (let i = 0; i < 12; i++) {
    monthly_stats.push({ sum: 0, count: 0 });
  }

  squeals_list.forEach((squeal) => {
    const date = new Date(squeal.date);
    const month = date.getMonth();

    monthly_stats[month].sum += squeal.positive_reactions;
    monthly_stats[month].count += 1;
  });

  // calcola media per ogni mese
  const averages = monthly_stats.map(({ sum, count }) => (count === 0 ? 0 : sum / count));
  return averages;
}

// ritorna array di 12 elementi, ad ogni mese la media del numero delle negative reactions di quel mese
function averageNegativeReactions(squeals_list) {
  if (!squeals_list || squeals_list.length === 0) {
    return [];
  }

  // creo array per tenere traccia delle somme e del numero di squeal per ogni mese
  const monthly_stats = [];
  for (let i = 0; i < 12; i++) {
    monthly_stats.push({ sum: 0, count: 0 });
  }

  squeals_list.forEach((squeal) => {
    const date = new Date(squeal.date);
    const month = date.getMonth();

    monthly_stats[month].sum += squeal.negative_reactions;
    monthly_stats[month].count += 1;
  });

  // calcola media per ogni mese
  const averages = monthly_stats.map(({ sum, count }) => (count === 0 ? 0 : sum / count));
  return averages;
}

// ritorna un intero = media delle impressions lungo tutti gli squeal
function totAverageImpressions(squeals_list) {
  let sum = 0, squeal_num = 0

  squeals_list.forEach((squeal) => {
    sum += squeal.impressions
    squeal_num += 1
  });

  return sum / squeal_num;
}

// ritorna un intero = media delle impressions lungo tutti gli squeal
function totAverageComments(squeals_list) {
  let sum = 0, squeal_num = 0

  squeals_list.forEach((squeal) => {
    sum += squeal.replies.length
    squeal_num += 1
  });

  return sum / squeal_num;
}

