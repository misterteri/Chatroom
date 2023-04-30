import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/auth"; // -> for authentication
import "firebase/compat/firestore"; // -> for database

import { useAuthState } from "react-firebase-hooks/auth"; // -> for authentication hook
import { useCollectionData } from "react-firebase-hooks/firestore"; // -> for database hook
import { signInWithEmailAndPassword } from "firebase/auth";

firebase.initializeApp({
  apiKey: "AIzaSyCG8dV0piBtTQs-KVU8HRfIV7o79-lbj9c",
  authDomain: "chatroom-project-e572e.firebaseapp.com",
  projectId: "chatroom-project-e572e",
  storageBucket: "chatroom-project-e572e.appspot.com",
  messagingSenderId: "698306210071",
  appId: "1:698306210071:web:211f7f37de7ce887a2af52",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="App">
      <header>
        <h1>Chatroom</h1>
        {user && <SignOut />}
      </header>

      <section>
        {user ? (
          <ChatRoom />
        ) : (
          <>
            <SignInOrSignUp isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          </>
        )}
      </section>
    </div>
  );
}
function SignInOrSignUp({ isSignUp, setIsSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const handleSignInOrSignUp = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Handle sign up
      try {
        await auth.createUserWithEmailAndPassword(email, password);
      } catch (error) {
        console.error(error);
      }
    } else {
      // Handle sign in
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSwitchForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div>
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSignInOrSignUp}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">{isSignUp ? "Register" : "Sign In"}</button>
      </form>
      <button onClick={handleSwitchForm}>
        {isSignUp
          ? "Already have an account? Sign In"
          : "Need to register? Sign Up"}
      </button>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
