import { IBaseService } from './IBaseService';
import { BadGatewayException } from '@nestjs/common';
import { Repository, BaseEntity } from 'typeorm';
import * as _ from 'lodash';

export class BaseService<T extends BaseEntity> implements IBaseService<T>{
  constructor(private readonly genericRepository: Repository<T>) { }
  private removeNullProps(obj: any): any {
    let ret: any;
    if (!Array.isArray(obj)) {
      ret = _.pickBy(obj, _.identity);
    } else {
      ret = _.pickBy(obj, o => o !== null && o !== undefined);
    }
    return ret;
  }

  create(entity: T | any): Promise<any> {
    try {
      return new Promise<T>((resolve, reject) => {
        this.genericRepository.save(this.removeNullProps(entity))
          .then(created => resolve(created))
          .catch(err => reject(err))
      })
    }
    catch (error) {
      throw new BadGatewayException(error);
    }
  }
  getAll(relations?: string[]): Promise<T[]> {
    try {
      return <Promise<T[]>>this.genericRepository.find({
        relations
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  get(id: number | string, relations?: string[]): Promise<T> {
    try { } catch (error) {
      throw new BadGatewayException(error);
    }
    return <Promise<T>>this.genericRepository.findOne(id, {
      relations
    });
  }
  delete(id: number) {
    try {
      this.genericRepository.delete(id)
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  update(entity: T | any): Promise<any> {
    try {
      return new Promise<any>((resolve, reject) => {
        this.genericRepository.findOne(entity.id)
          .then((responseGet: T | any) => {
            try {
              if (responseGet == null) reject('Not existing')
              this.genericRepository.merge(entity, responseGet);

              this.genericRepository.save(entity, responseGet)
                .then(response => resolve(response))
                .catch(err => reject(err))
            }
            catch (e) {
              reject(e)
            }
          })
          .catch(err => reject(err))
      })
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  updateAll(entity: T | any): Promise<any> {
    try {
      return new Promise<any>((resolve, reject) => {
        this.genericRepository.find(entity.id)
          .then((responseGet: T | any) => {
            try {
              if (responseGet == null) reject('Not existing')
              this.genericRepository.update(entity.id, entity)
                .then(response => resolve(response))
                .catch(err => reject(err))
            }
            catch (e) {
              reject(e)
            }
          })
          .catch(err => reject(err))
      })
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}