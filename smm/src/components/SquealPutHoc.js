import React from 'react'
import { useLocation } from 'react-router-dom';
import SquealPut from './SquealPut.js';


// this is needed because react router dom doesn't pass query params to the class components
// this is the best way i could retain the class component, i hate react
function withQueryParams(Component) {
  return function WrappedComponent(props) {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const replyto = searchParams.get("replyto");
    const receiver = searchParams.get("receiver");

    return <Component {...props} replyto={replyto} receiver={receiver} />;
  }
}

export const SquealPutHoc = withQueryParams(SquealPut);
