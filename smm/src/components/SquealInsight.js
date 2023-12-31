import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Squeal from './Squeal';



// functional component, because in class components params don't work for some reason
export default function SquealInsight(props) {

  const [replies, setReplies] = useState(null);
  const { id } = useParams();
  const [squeal, setSqueal] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('insights'); // Added selectedPanel state
  const [moreReplies, setMoreReplies] = useState(true); // Added moreReplies state

  let startIndex = 0;
  let endIndex = 10;

  const loadReplies = () => {
    //retrieve replies
    fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}/replies?startindex=${startIndex}&endindex=${endIndex}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
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
    fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        if (res.id === id) {
          console.log(res);
          setSqueal(res);
        }
      })
      .catch(err => console.log(err));
  }, [id]); // Depend on 'id' so the effect runs whenever 'id' changes


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
            <p> insights selected</p>
            {/* Render insights here */}
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

