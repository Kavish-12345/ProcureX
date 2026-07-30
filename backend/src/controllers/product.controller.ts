import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema.js';

export async function createProduct (req: Request, res: Response){
    try{
    const data = req.body as CreateProductInput; 
    const supplierId = req.user!.userId; 

    const product = await prisma.product.create({
        data: {
        name: data.name,
        description: data.description,
        unitPrice: data.unitPrice,
        stock: data.stock,
        unit: data.unit,
        supplierId,
      },
    })

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
    } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Something went wrong while creating the product' });
    }
}

export async function getMyProducts(req: Request, res: Response) {
  try {
    const supplierId = req.user!.userId;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = (req.query.search as string)?.trim();

    const where = {
      supplierId,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithTotal = products.map((p) => ({
      ...p,
      totalValue: Number(p.unitPrice) * p.stock,
    }));

    return res.status(200).json({
      products: productsWithTotal,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get my products error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching products' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true, businessName: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productWithTotal = {
      ...product,
      totalValue: Number(product.unitPrice) * product.stock,
    };

    return res.status(200).json({ product: productWithTotal });
  } catch (error) {
    console.error('Get product by id error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching the product' });
  }
}

export async function updateProduct(req: Request, res:Response){
  try{
  const { id } = req.params; 
  if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid product id' });
  }
  const supplierId = req.user!.userId; 
  const data = req.body as UpdateProductInput;

  const existingProduct = await prisma.product.findUnique({
    where: {id}
  }); 

  if(!existingProduct){
    return res.status(404).json({ message: 'Product not found' });
  }

  if (existingProduct.supplierId !== supplierId) {
    return res.status(403).json({ message: 'You do not own this product' });
  }

  const updatedProduct = await prisma.product.update({
    where: {id}, 
    data,
  });

  return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Something went wrong while updating the product' });
}
}

export async function deleteProduct(req: Request, res: Response) {
  try{
    const {id} = req.params; 
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const supplierId = req.user!.userId; 

      const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (existingProduct.supplierId !== supplierId) {
      return res.status(403).json({ message: 'You do not own this product' });
    }

    await prisma.product.delete({
      where: {id}
    });
    return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Something went wrong while deleting the product' });
  }
}

export async function getProductsBySupplier(req: Request, res: Response) {
  try {
    const { supplierId } = req.params;
    if (!supplierId || typeof supplierId !== 'string') {
      return res.status(400).json({ message: 'Invalid supplier id' });
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = (req.query.search as string)?.trim();

    const where = {
      supplierId,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithTotal = products.map((p) => ({
      ...p,
      totalValue: Number(p.unitPrice) * p.stock,
    }));

    return res.status(200).json({
      products: productsWithTotal,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products by supplier error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching products' });
  }
}
