import { get, set } from 'idb-keyval';

const getNotebookDBKey = (owner) => `${owner}_Notebook_History`;

export const getNotebookDeployments = async (owner) => {
  return (await get(getNotebookDBKey(owner))) || [];
};

export const setNotebookDeployments = async (owner, deployments) => {
  return set(getNotebookDBKey(owner), deployments);
};

const getModelDBKey = (owner) => `${owner}_Model_History`;

export const getModelDeployments = async (owner) => {
  return (await get(getModelDBKey(owner))) || [];
};

export const setModelDeployments = async (owner, deployments) => {
  return set(getModelDBKey(owner), deployments);
};