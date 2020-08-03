import React from 'react';
import { useAmazonIVS } from './AmazonIVS';

function ClassMethodVideo() {
  const { AmazonIVS, setStreamParam } = useAmazonIVS();

  return <AmazonIVS />;
}

export default ClassMethodVideo;
