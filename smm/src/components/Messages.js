import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MiniProfileCard from './MiniProfileCard';
import axios from 'axios';

import './Messages.css';

export default function MessagesView({selectedAccount}) {
  const [isValid, setIsValid] = useState(false);
  const [profile, setProfile] = useState({});
  const [newMsgText, setNewMsgText] = useState("");
  const [chat, setChat] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(9);
  const [updateInterval, setUpdateInterval] = useState(null);

  const user = selectedAccount ? selectedAccount.name : null;
  const { id } = useParams();

  useEffect(() => {
    const checkForValidUsers = async () => {
      let response = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${id}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return response.status === 200 && user !== null;
    }

    const fetchChat = async () => {
      let response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${user}&user2=${id}&startindex=${startIndex}&endindex=${endIndex}`);
      let data = await response.json();
      if (data.message === "chat profile does not exist") {
        return;
      }
      setChat(data.reverse());
      setStartIndex(startIndex + 10);
      setEndIndex(endIndex + 10);
    }

    const init = async () => {
      setIsValid(await checkForValidUsers());
      if (isValid) {
        await fetchChat();
        setUpdateInterval(setInterval(newMsgAvailable, 1000));
      }
    }

    init();

    return () => {
      if (updateInterval !== null) {
        clearInterval(updateInterval);
      }
    }
  }, [id, user, isValid, startIndex, endIndex]);

  const loadProfile = async () => {
    let response = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${id}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (response.status === 200) {
      const data = await response.json()
      setIsValid(true);
      setProfile(data);
    }
  }

  useEffect(() => {  
    loadProfile();
  }, []); // Empty dependency array

  const loadMore = async () => {
    let response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${user}&user2=${id}&startindex=${startIndex}&endindex=${endIndex}`);
    let newMsgs = await response.json();
    setChat([...newMsgs.reverse(), ...chat]);
    setStartIndex(startIndex + 10);
    setEndIndex(endIndex + 10);
  }

  const sendMessage = async () => {
    const newMessage = {
      author: user,
      text: newMsgText,
      receiver: id,
      is_private: true,
    }

    const formData = new FormData();
    formData.append("json", JSON.stringify(newMessage));

    try {
      await axios.put(`https://site222326.tw.cs.unibo.it/squeals/`, formData);
      const response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${user}&user2=${id}&startindex=${0}&endindex=${0}`);

      if (response.ok) {
        const newMsg = await response.json();
        setChat([...chat, newMsg[0]]);
        setNewMsgText('');
      } else {
        console.error("Error retrieving the new message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending the message:", error.message);
    }
  }

  const newMsgAvailable = async () => {
    if (chat.length !== 0) {
      let response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${user}&user2=${id}&startindex=${0}&endindex=${0}`);
      let lastMsgDb = await response.json();

      if (lastMsgDb[0].id !== chat[chat.length - 1].id) {
        setChat([...chat, lastMsgDb[0]]);
        loadProfile();
      }
    }
  }

  const getMessageClass = (author) => {
    return {
      'message': true,
      'sent-message': author === user,
      'received-message': author === id,
    };
  }

  return isValid ? (
    <div className="messagesViewContainer" role="main">
      <div className="searchArea">
        <Link to="/smm/messages" className="goBackBtn" aria-label="Go back to messages">Go back</Link>
        {profile && (<MiniProfileCard profile={profile} />)}
      </div>

      <div className="chatBox container mx-0 mx-auto">
        {chat.length > 0 && <button onClick={loadMore} className="loadMoreBtn" aria-label="Load more messages"> Load more </button>}
        <div className="chatInner" role="log" aria-live="polite">
          {chat.map((message, index) => (
            <div role="listitem" className={getMessageClass(message.author)} key={index}>
              {message.text}
            </div>
          ))}
        </div>
      </div>

      <div className="messageInput d-flex justify-content-center">
        <input 
          value={newMsgText} 
          onChange={e => setNewMsgText(e.target.value)} 
          type="text" 
          placeholder="Write your message..." 
          className="form-control"
          aria-label="Type your message"
        />
        <button onClick={sendMessage} aria-label="Send message" className="btn btn-primary"> Send </button>
      </div>
    </div>
  ) : (
    <div>
      <p>You are not logged in or this user does not exist</p>
      <Link to="/smm/messages">Go back</Link>
    </div>
  );
}