import * as tagsService from './tags.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const listTags = async (req, res) => {
  const tags = await tagsService.listTags();
  ApiResponse.ok(res, { tags });
};

export const getTag = async (req, res) => {
  const tag = await tagsService.getTag(req.params.slug);
  ApiResponse.ok(res, { tag });
};
