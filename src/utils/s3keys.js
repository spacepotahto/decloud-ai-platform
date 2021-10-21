import { del, get, set } from 'idb-keyval';

const getDBKey = (owner) => `${owner}_S3`;

export const getS3Keys = async (owner) => {
  return get(getDBKey(owner));
};

export const setS3Keys = async (owner, keys) => {
  return set(getDBKey(owner), keys);
};

export const delS3Keys = async (owner) => {
  return del(getDBKey(owner));
};