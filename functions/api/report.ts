import {
  handleReportRequest,
  runCloudflarePostHandler,
  type PagesFunctionContext,
} from '../../server/cloudflareAdapter.ts';

export const onRequestOptions = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleReportRequest);

export const onRequestPost = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleReportRequest);
