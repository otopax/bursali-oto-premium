export class GetPostPathsUseCase {
  /**
   * @param {import('../interfaces/IContentRepository').IContentRepository} contentRepository 
   */
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
  }

  async execute(folder = 'blog') {
    return await this.contentRepository.getAllPostIds(folder);
  }
}
