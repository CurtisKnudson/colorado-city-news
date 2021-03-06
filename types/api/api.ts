import { Article, ArticleComment } from "types/article";
import { NonUserProfile, User } from "types/user";

export interface ApiInterface {
  viewAnotherUserByProfileUrl(profileUrl: string): Promise<NonUserProfile>;
  getUserByEmail(email: string): Promise<User>;
  updateUserProfile(userProfileData: User): Promise<User>;
  publishArticle(article: Article): Promise<any>;
  doesArticleUrlExist(url: string): any;
  getAllArticles(): Promise<Article[]>;
  getArticleCommentsByArticleId(
    articleId: string
  ): Promise<ArticleComment[] | null | undefined>;
  addCommentToArticle(comment: ArticleComment): Promise<any>;
  updateCommentVoteCount(
    commentId: string,
    voteCountObject: { count: number; usersWhoVoted: string[] }
  ): Promise<any>;
  addProfileUrl(email: string, profileUrl: string): Promise<User>;
  validateProfileUrl(profileUrl: string): Promise<any>;
}
