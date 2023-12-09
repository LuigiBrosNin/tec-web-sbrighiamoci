import React from 'react'
import { useParams } from 'react-router-dom';

// functional component, because in class components params don't work for some reason
export default function SquealInsight() {
  const { id } = useParams();

  let squeal = null;

  //retrieve squeal
  fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}`, {
    method: "GET"
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      if (res.ok) {
        squeal = res;
      }
    })
    .catch(err => console.log(err));

  return (
    <div>Squeal id: {id}</div>
  )
}
