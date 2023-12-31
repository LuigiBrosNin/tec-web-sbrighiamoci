import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Messages.css';

export default function MessagesSearchBar() {
  const [searchUser, setSearchUser] = useState("");
  const navigate = useNavigate();

  const searchChat = async () => {
    console.log(searchUser)
    let response = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${searchUser}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (response.status === 200) {
      navigate(`${searchUser}`);
    }
  }

  return (
    <div className="container d-flex justify-content-center">
      <div className="col-sm-8 mx-auto my-2">
        <div className="col-sm-8 mx-auto">
          <div className="form-group d-flex align-items-center">
            <input 
              value={searchUser} 
              onChange={e => setSearchUser(e.target.value)} 
              type="text" 
              placeholder="Search profiles..." 
              className="form-control searchProfileTextbox"
            />
            <button onClick={searchChat} className="searchBtn">Search</button>
          </div>
        </div>
      </div>
    </div>
  );
}