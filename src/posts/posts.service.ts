import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { Post, Prisma } from '@prisma/client'
import { PaginatedResult, PaginateFunction, paginator } from 'src/utils/paginator'

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(postWhereUniqueInput: Prisma.PostWhereUniqueInput): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    })
  }

  async posts(params: {
    skip?: number
    take?: number
    cursor?: Prisma.PostWhereUniqueInput
    where?: Prisma.PostWhereInput
    orderBy?: Prisma.PostOrderByWithRelationInput
    page?: number
  }): Promise<PaginatedResult<Post>> {
    const { skip, take, cursor, where, orderBy, page } = params

    const paginate: PaginateFunction = paginator({ perPage: 10 })

    return paginate(
      this.prisma.post,
      {
        where,
        orderBy,
      },
      {
        page,
      },
    )

    // return this.prisma.post.findMany({
    //   skip,
    //   take,
    //   cursor,
    //   where,
    //   orderBy,
    // })
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    })
  }

  async updatePost(params: { where: Prisma.PostWhereUniqueInput; data: Prisma.PostUpdateInput }): Promise<Post> {
    const { data, where } = params
    return this.prisma.post.update({
      data,
      where,
    })
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    })
  }
}
