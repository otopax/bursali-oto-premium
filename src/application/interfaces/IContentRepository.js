/**
 * @interface IContentRepository
 * Defines the contract for fetching markdown/MDX content.
 */
export class IContentRepository {
  async getSortedPostsData(locale, folder) {
    throw new Error('Not implemented');
  }

  async getAllPostIds(folder) {
    throw new Error('Not implemented');
  }

  async getPostData(slug, folder) {
    throw new Error('Not implemented');
  }
}
