import {
  handleChartSummaryRequest,
  runCloudflarePostHandler,
  type PagesFunctionContext,
} from '../../server/cloudflareAdapter.ts';

export const onRequestOptions = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleChartSummaryRequest);

export const onRequestPost = (context: PagesFunctionContext) =>
  runCloudflarePostHandler(context, handleChartSummaryRequest);
