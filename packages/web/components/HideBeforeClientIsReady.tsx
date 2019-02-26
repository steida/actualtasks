import Head from 'next/head';
import React, { FunctionComponent, useState, useEffect } from 'react';

// Because JavaScript based responsive design does not work on the server,
// we have to hide content before app component will mount.
// Sure we can fix it via CSS media queries, but it's unnecessary for JS
// app not providing server content.

const HideBeforeClientIsReady: FunctionComponent = props => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    setIsHidden(false);
  }, []);

  return (
    <>
      {isHidden && (
        <Head>
          <style>{`html, body { display: none } `}</style>
        </Head>
      )}
      {props.children}
    </>
  );
};

export default HideBeforeClientIsReady;
