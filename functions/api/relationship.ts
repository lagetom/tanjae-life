import {
  handleRelationshipRequest,
  runCloudflarePostHandler,
  type PagesFunctionContext,
} from '../../server/cloudflareAdapter.ts';

export const onRequestOptions = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleRelationshipRequest);

export const onRequestPost = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleRelationshipRequest);
