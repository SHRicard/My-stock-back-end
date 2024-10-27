import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import moment from 'moment';
import {GlobalLog, Products} from '../models';
import {ProductsRepository} from '../repositories';
import {GlobalLogService} from '../services/global-log.service';

export class ProductsControllerController {
  constructor(
    @repository(ProductsRepository)
    public productsRepository: ProductsRepository,
    @inject('services.GlobalLogService')
    public globalLogService: GlobalLogService,
  ) {}

  //All Productos
  @get('/products')
  async findProducts(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<object> {
    const skip = (page - 1) * limit;

    const filter = {
      limit: limit,
      skip: skip,
      order: ['id DESC'],
    };

    const totalProducts = await this.productsRepository.count();

    const totalPages = Math.ceil(totalProducts.count / limit);

    const products = await this.productsRepository.find(filter);

    return {
      data: products,
      totalItems: totalProducts.count,
      totalPages: totalPages,
    };
  }
  //FILTRO POR NOMBRE+PAGINADO
  @get('/products/search')
  async searchProducts(
    @param.query.string('searchType') searchType: string,
    @param.query.string('term') term: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<object> {
    const skip = (page - 1) * limit;

    const filter = {
      where: {} as any,
      limit: limit,
      skip: skip,
      order: ['id DESC'],
    };

    if (searchType === 'name') {
      filter.where = {
        name: {
          like: `${term}.*`,
        },
      };
    }

    if (searchType === 'dimension') {
      filter.where = {
        dimension: {
          like: `${term}.*`,
        },
      };
    }

    const totalProducts = await this.productsRepository.count(filter.where);

    if (totalProducts.count === 0) {
      return {
        data: [],
        totalItems: 0,
        totalPages: 0,
      };
    }

    const totalPages = Math.ceil(totalProducts.count / limit);
    const products = await this.productsRepository.find(filter);

    return {
      data: products,
      totalItems: totalProducts.count,
      totalPages: totalPages,
    };
  }

  //Crear Productos
  @post('/products/create', {
    responses: {
      '200': {
        description: 'Product created successfully',
        content: {'application/json': {schema: {'x-ts-type': Products}}},
      },
    },
  })
  async createProduct(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'name',
              'quantity',
              'description',
              'type',
              'dimension',
              'price',
            ],
            properties: {
              name: {type: 'string'},
              quantity: {type: 'number'},
              description: {type: 'string'},
              type: {type: 'string'},
              dimension: {type: 'string'},
              price: {type: 'string'},
            },
          },
        },
      },
    })
    productData: Omit<Products, 'id'>,
  ): Promise<Products> {
    if (productData.quantity <= 0) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Creacion De Producto',
          entityId: 'id',
          changes: {
            data: `${productData.quantity}`,
            message: `El Producto fue igual a 0 o menos a 0`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.BadRequest('Quantity must be greater than 0');
    }
    const create = moment().startOf('day').toDate();

    const product = {
      ...productData,
      create,
    };

    const newProduct = await this.productsRepository.create(product);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'products',
        operation: 'Creacion De Producto',
        entityId: 'id',
        changes: {
          data: `${productData}`,
          message: `El Producto creado`,
        },
        date: moment().toISOString(),
      }),
    );
    return newProduct;
  }
  // borrar un producto
  @del('/products/delete/{id}', {
    responses: {
      '204': {
        description: 'Product deleted successfully',
      },
      '404': {
        description: 'Product not found',
      },
    },
  })
  async deleteProduct(@param.path.string('id') id: string): Promise<void> {
    const productExists = await this.productsRepository.exists(id);

    if (!productExists) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Producto Borrado',
          entityId: id,
          changes: {
            data: `El Producto no existe`,
            message: `El Producto fue borrado`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.NotFound(`Product with id ${id} not found`);
    }

    const deleteProduct = await this.productsRepository.deleteById(id);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'products',
        operation: 'Producto Borrado',
        entityId: id,
        changes: {
          data: `El Producto fue borrado`,
          message: `El Producto fue borrado`,
        },
        date: moment().toISOString(),
      }),
    );

    return deleteProduct;
  }
  //Buscar 1 producto
  @get('/products/search/{id}', {
    responses: {
      '200': {
        description: 'Product found',
        content: {'application/json': {schema: {'x-ts-type': Products}}},
      },
      '404': {
        description: 'Product not found',
      },
    },
  })
  async findProductById(
    @param.path.string('id') id: string,
  ): Promise<Products> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualización de Producto',
          entityId: id,
          changes: {
            data: `No producto no existe ${id}`,
            message: `No producto no existe`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.NotFound(`Product with id ${id} not found`);
    }
    return product;
  }
  //Editar Producto
  @put('/products/update/{id}', {
    responses: {
      '204': {
        description: 'Product updated successfully',
      },
    },
  })
  async updateProduct(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              quantity: {type: 'number'},
              description: {type: 'string'},
              dimension: {type: 'string'},
              type: {type: 'string'},
              price: {type: 'string'},
            },
            required: ['name', 'quantity', 'description', 'dimension', 'price'],
          },
        },
      },
    })
    product: Partial<Products>,
  ): Promise<void> {
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualización de Producto',
          entityId: id,
          changes: {
            data: `No producto no existe ${id}`,
            message: `No producto no existe`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.NotFound(`Producto con id ${id} no encontrado`);
    }

    const updatedData: Partial<Products> = {};
    if (product.name && product.name !== existingProduct.name) {
      updatedData.name = product.name;
    }
    if (product.quantity && product.quantity !== existingProduct.quantity) {
      updatedData.quantity = product.quantity;
    }
    if (
      product.description &&
      product.description !== existingProduct.description
    ) {
      updatedData.description = product.description;
    }
    if (product.dimension && product.dimension !== existingProduct.dimension) {
      updatedData.dimension = product.dimension;
    }
    if (product.type && product.type !== existingProduct.type) {
      updatedData.type = product.type;
    }
    if (product.price && product.price !== existingProduct.price) {
      updatedData.price = product.price;
    }

    if (Object.keys(updatedData).length === 0) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualización de Producto',
          entityId: id,
          changes: {
            data: `No hay cambios para actualizar`,
            message: `No hay cambios para actualizar`,
          },
          date: moment().toISOString(),
        }),
      );

      throw new HttpErrors.BadRequest('No hay cambios para actualizar');
    }

    const update = await this.productsRepository.updateById(id, updatedData);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'products',
        operation: 'Actualización de Producto',
        entityId: id,
        changes: {
          data: JSON.stringify({additionalProperties: updatedData}),
          message: `No hay cambios para actualizar`,
        },
        date: moment().toISOString(),
      }),
    );
    return update;
  }
  //Actualizar stock
  @post('/products/update/count')
  async updateProductCount(
    @requestBody() {registerId, count}: {registerId: string; count: number},
  ): Promise<{message: string; newCount: number}> {
    const product = await this.productsRepository.findById(registerId);
    const stockAct = product.quantity;

    let newCount = stockAct;

    if (stockAct === 0 && count < 0) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualizacion de Cantidad',
          entityId: registerId,
          changes: {
            data: count,
            message: 'El stock no puede ser negativo.',
          },
          date: moment().toISOString(),
        }),
      );
      return {
        message: 'El stock no puede ser negativo.',
        newCount: stockAct,
      };
    }

    if (count > 0) {
      newCount = stockAct + count;
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualizacion de Cantidad, Suma',
          entityId: registerId,
          changes: {
            data: count,
            message: `El stock Actualizado Correctamente, Antes : ${stockAct}, Ingresante ${count}, Total ${newCount}
            `,
          },
          date: moment().toISOString(),
        }),
      );
    }

    if (count < 0) {
      newCount = stockAct + count;
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'products',
          operation: 'Actualizacion de Cantidad, Resta',
          entityId: registerId,
          changes: {
            data: count,
            message: `El stock Actualizado Correctamente, Antes : ${stockAct}, Egreso ${count}, Total ${newCount}
            `,
          },
          date: moment().toISOString(),
        }),
      );
    }

    await this.productsRepository.updateById(registerId, {
      quantity: newCount,
    });

    return {
      message: 'Cantidad actualizada correctamente.',
      newCount,
    };
  }
}
