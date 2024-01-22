import React, { useState, useEffect } from 'react';

//*Alex - Importazione dati e tipi di grafico per gli insights
import { top_10_words, average_impressions, average_comments, average_text, average_pos_reactions, average_neg_reactions } from './InsightsData.js'
import TopWordsChart, { AverageImpressionsChart, AverageCommentsChart, AveragePosReactionsChart, AverageNegReactionsChart } from './InsightsChart';
import { fetchData } from './InsightsData.js';


export default function ProfileInsightFunctional(props) {

  const [check, setCheck] = useState(null)
  const updateComponent = async () => {
    const check = await fetchData(props.selectedAccount.name);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setLocalTop10({
      labels: top_10_words.map((data) => data[0]), // Utilizza il primo campo di ogni coppia
      datasets: [{
        label: "Number of occurrencies",
        data: top_10_words.map((data) => data[1]), // Utilizza il secondo campo di ogni coppia
      }]
    })
    setAvgImpressions({
      labels: months,
      datasets: [{
        label: "Average impressions over the last 12 months",
        data: average_impressions,
      }]
    })
    setAvgComments({
      labels: months,
      datasets: [{
        label: "Average comments over the last 12 months",
        data: average_comments,
      }]
    })
    setPosReactions({
      labels: months,
      datasets: [{
        label: "Average positive reactions over the last 12 months",
        data: average_pos_reactions,
      }]
    })
    setNegReactions({
      labels: months,
      datasets: [{
        label: "Average negative reactions over the last 12 months",
        data: average_neg_reactions,
      }]
    })
    setCheck(check);
  } 
  useEffect(() => {
    updateComponent();
  }, [props.selectedAccount]) ;  // chiama useEffect ogni volta che selectedAcocount cambia


  //*Alex - Settaggio dei dati per i grafici *//

  // grafico parole piu' usate
  const [local_top_10, setLocalTop10] = useState({
    labels: top_10_words.map((data) => data[0]), // Utilizza il primo campo di ogni coppia
    datasets: [{
      label: "Number of occurrencies",
      data: top_10_words.map((data) => data[1]), // Utilizza il secondo campo di ogni coppia
    }]
  });

  // grafico media impressions ultimi 12 mesi
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [local_avg_impressions, setAvgImpressions] = useState({
    labels: months,
    datasets: [{
      label: "Average impressions over the last 12 months",
      data: average_impressions,
    }]
  });

  // grafico media commenti ultimi 12 mesi
  const [local_avg_comments, setAvgComments] = useState({
    labels: months,
    datasets: [{
      label: "Average comments over the last 12 months",
      data: average_comments,
    }]
  });

  // grafico media positive reactions ultimi 12 mesi
  const [local_pos_reactions, setPosReactions] = useState({
    labels: months,
    datasets: [{
      label: "Average positive reactions over the last 12 months",
      data: average_pos_reactions,
    }]
  });

  // grafico media negative reactions ultimi 12 mesi
  const [local_neg_reactions, setNegReactions] = useState({
    labels: months,
    datasets: [{
      label: "Average negative reactions over the last 12 months",
      data: average_neg_reactions,
    }]
  });

  if (props.selectedAccount == null) {
    return (
      <div>
        <h1>Select an account</h1>
      </div>
    )
  }

  if (!check) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-3">
      <div className="container mt-5">
        <div className="row">
          <div className="col-lg-6">
            <div className="p-1">
              <p> Top 10 most used words </p>
              {<TopWordsChart chartData={local_top_10} />}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="p-1">
              {<AverageImpressionsChart chartData={local_avg_impressions} />}
              {<AverageCommentsChart chartData={local_avg_comments} />}
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-lg-6">
            <div className="p-1">
              {<AveragePosReactionsChart chartData={local_pos_reactions} />}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="p-1">
              {<AverageNegReactionsChart chartData={local_neg_reactions} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}