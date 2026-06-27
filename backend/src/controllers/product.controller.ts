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

export async function getMyProducts(req: Request , res: Response) {
  try{
  const supplierId = req.user!.userId; 

  const products = await prisma.product.findMany({
    where: {supplierId},
    orderBy: {createdAt: 'desc'}
  }); 
  return res.status(200).json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching products' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try{
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

    return res.status(200).json({ product });
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
