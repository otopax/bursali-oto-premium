export class GetSortedPostsUseCase {
  /**
   * @param {import('../interfaces/IContentRepository').IContentRepository} contentRepository 
   */
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
  }

  async execute(locale = 'tr', folder = 'blog') {
    return await this.contentRepository.getSortedPostsData(locale, folder);
  }
}
