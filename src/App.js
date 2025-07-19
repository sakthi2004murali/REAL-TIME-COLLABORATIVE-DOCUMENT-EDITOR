import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");
const DOCUMENT_ID = "1234567890abcdef"; // example doc ID

function App() {
    const [content, setContent] = useState("");
    const editorRef = useRef(null);

    useEffect(() => {
        socket.emit("get-document", DOCUMENT_ID);
        socket.on("load-document", doc => setContent(doc));
    }, []);

    useEffect(() => {
        socket.on("receive-changes", delta => {
            setContent(delta);
        });
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setContent(value);
        socket.emit("send-changes", value);
        socket.emit("save-document", value);
    }

    return (
        <div>
            <h1>Real-Time Collaborative Document Editor</h1>
            <textarea
                value={content}
                onChange={handleChange}
                ref={editorRef}
                rows="20"
                cols="100"
            />
        </div>
    );
}

export default App;
