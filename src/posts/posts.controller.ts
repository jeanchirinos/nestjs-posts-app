import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Post as PostModel } from '@prisma/client'
import { Public } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { PaginatedResult } from 'src/utils/paginator'
import { PostsService } from './posts.service'
import { UserSession } from 'src/auth/types/session'
import { CreateDraftDto } from './dtos/createdraft.dto'
import { isOwner } from 'src/utils/isOwner'

@ApiTags('posts')
@ApiSecurity('x-api-key')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('posts')
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPublishedPosts(
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    return this.postsService.posts({
      where: { published: true },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  @Public()
  @Get('posts/:id')
  async getPostById(@Param('id') id: number): Promise<PostModel> {
    const post = await this.postsService.post({ id, published: true })

    if (!post) throw new NotFoundException('Post not found')

    return post
  }

  @Public()
  @Get('posts/search/:searchString')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getFilteredPosts(
    @Param('searchString') searchString: string,
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    return this.postsService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
        published: true,
      },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  @Public()
  @Get('user/:userId/posts')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserPosts(
    @Param('userId') userId: number,
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    return this.postsService.posts({
      where: {
        authorId: userId,
        published: true,
      },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  // Auth
  @ApiBearerAuth()
  @Get('user/posts')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['published', 'drafts'] })
  async getPostsByUser(
    @CurrentUser() user: UserSession,
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
    @Query('type') type?: 'published' | 'drafts',
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    const published = type === 'published' ? true : type === 'drafts' ? false : undefined

    return this.postsService.posts({
      where: {
        authorId: user.id,
        published,
      },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  @ApiBearerAuth()
  @Post('posts')
  async createDraft(@Body() postData: CreateDraftDto, @CurrentUser() user: UserSession): Promise<PostModel> {
    const { title, content } = postData

    return this.postsService.createPost({
      title,
      content,
      author: {
        connect: { id: user.id },
      },
    })
  }

  @ApiBearerAuth()
  @Get('posts/:id/auth')
  async getPostByIdAuth(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id, authorId: user.id })

    if (!post) throw new NotFoundException('Post not found')

    return post
  }

  @ApiBearerAuth()
  @Patch('posts/publish/:id')
  async publishPost(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.published) {
      throw new InternalServerErrorException('Post is already published')
    }

    isOwner({ currentUserId: user.id, userId: post.authorId, message: 'You do not own this post' })

    try {
      return this.postsService.updatePost({
        where: { id },
        data: { published: true },
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to publish post')
    }
  }

  @ApiBearerAuth()
  @Delete('posts/:id')
  async deletePost(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    isOwner({ currentUserId: user.id, userId: post.authorId, message: 'You do not own this post' })

    try {
      return this.postsService.deletePost({ id })
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete post')
    }
  }
}
