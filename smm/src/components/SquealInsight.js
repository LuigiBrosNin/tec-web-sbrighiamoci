import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Squeal from './Squeal';

//*Alex - Importazione dati e tipi di grafico per gli insights
import { top_10_words, average_impressions, average_comments, average_text, average_pos_reactions, average_neg_reactions, tot_average_impressions, tot_average_comments } from './InsightsData.js'   
import TopWordsChart, { AverageImpressionsChart, AverageCommentsChart, AveragePosReactionsChart, AverageNegReactionsChart, BipartiteReactionsChart, CompareAvgImpressionsChart, CompareAvgCommentsChart, ImpressionsVsReactionsChart, ImpressionsVsCommentsChart } from './InsightsChart';
import { fetchData } from './InsightsData.js';

// functional component, because in class components params don't work for some reason
export default function SquealInsight(props) {

  const [replies, setReplies] = useState(null);
  const { id } = useParams();
  const [squeal, setSqueal] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('insights'); // Added selectedPanel state
  const [moreReplies, setMoreReplies] = useState(true); // Added moreReplies state

  //*Alex - Settaggio dei grafici *//

  const [local_bipartite_reactions, setBipartiteReactions] = useState(null)
  const [local_tot_avg_impressions, setAvgImpressions] = useState(null)
  const [local_tot_avg_comments, setAvgComments] = useState(null)
  const [local_imp_vs_react, setImpressionsVsReactions] = useState(null)
  const [local_imp_vs_comments, setImpressionsVsComments] = useState(null)

  const updateComponent = async (tmp_squeal) => {

    const tmp = [tmp_squeal.positive_reactions, tmp_squeal.negative_reactions]
    setBipartiteReactions({
      labels: ["Positive Reactions", "Negative Reactions"],
      datasets: [{
        label: "Positive Reactions vs Negative Reactions",
        data: tmp,
      }]
    })

    const tmp2 = [tmp_squeal.impressions, tot_average_impressions]
    setAvgImpressions({
      labels: ["Squeal Reactions", "Average Squeal Reactions"],
      datasets: [{
        label: "Squeal Reactions vs Average Squeal Reactions",
        data: tmp2,
      }]
    })

    const tmp3 = [tmp_squeal.replies.length, tot_average_comments]
    setAvgComments({
      labels: ["Squeal Replies", "Average Squeal Replies"],
      datasets: [{
        label: "Squeal Replies vs Average Squeal Replies",
        data: tmp3,
      }]
    })

    const tmp4 = [tmp_squeal.impressions, tmp_squeal.positive_reactions + tmp_squeal.negative_reactions]
    setImpressionsVsReactions({
      labels: ["Impressions", "Total Reactions"],
      datasets: [{
        label: "Impressions vs Totality of Reactions",
        data: tmp4,
      }]
    })

    const tmp5 = [tmp_squeal.impressions, tmp_squeal.replies.length]
    setImpressionsVsComments({
      labels: ["Impressions", "Comments"],
      datasets: [{
        label: "Impressions vs Comments",
        data: tmp5,
      }]
    })
  }

  let startIndex = 0;
  let endIndex = 10;

  const loadReplies = () => {
    //retrieve replies
    fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}/replies?startindex=${startIndex}&endindex=${endIndex}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        setReplies(res);
        startIndex += 10;
        endIndex += 10;
        if (res.length === 0 || res.length < 10) {
          setMoreReplies(false);
        }
      })
      .catch(err => console.log(err));
  }

  useEffect(() => {
    //retrieve squeal
    console.log("UPDATING")
    fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        if (res.id === id) {
          setSqueal(res);
          updateComponent(res)
        }
      })
      .catch(err => console.log(err));
  }, [id]); // Depend on 'id' so the effect runs whenever 'id' change

  if (props.selectedAccount == null) {
    return (
      <div>
        <h1>Select an account</h1>
      </div>
    )
  }

  if (squeal == null) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    )
  }


  return (
    <div>

      <Squeal squeal={squeal} selectedAccount={props.selectedAccount} />

      <div className="container">
        <div className="btn-group" role="group" aria-label="Panel choice">
          <button
            type="button"
            className={`btn ${selectedPanel === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedPanel('insights')}
          >
            Insights
          </button>
          <button
            type="button"
            className={`btn ${selectedPanel === 'replies' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedPanel('replies')}
          >
            Replies
          </button>
        </div>
        {selectedPanel === 'insights' && (
          <div className="mt-3">
            <div className="container mt-5">
              <div className="row">
                <div className="col-lg-6">
                  <div className="p-1">
                    <BipartiteReactionsChart chartData={local_bipartite_reactions} />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="p-1">
                    <CompareAvgImpressionsChart chartData={local_tot_avg_impressions} />
                    <CompareAvgCommentsChart chartData={local_tot_avg_comments} />
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-lg-6">
                  <div className="p-1">
                    <ImpressionsVsReactionsChart chartData={local_imp_vs_react} />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="p-1">
                    <ImpressionsVsCommentsChart chartData={local_imp_vs_comments} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedPanel === 'replies' && (
          <div className="mt-3">
            {/* Render replies here */}
            {replies == null ? (
              <button className="btn btn-primary" onClick={loadReplies}>Load replies</button>
            ) : (
              <div>
              {replies.map((reply) => (
                <div key={reply.id}>
                  <Squeal selectedAccount={props.selectedAccount} squeal={reply} />
                </div>
              ))}
              {moreReplies && (
                <button className="btn btn-primary" onClick={loadReplies}>Load more replies</button>
                )}
              </div>
            )
            }

            
          </div>
        )}
      </div>
    </div>
  )
}

