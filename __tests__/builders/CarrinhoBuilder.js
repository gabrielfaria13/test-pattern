import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { User } from '../../src/domain/User.js';

export class CarrinhoBuilder {
  constructor() {
    // valores padrão
    this.user = new User(1, 'Usuário Default', 'user@default.com', 'PADRAO');
    this.itens = [new Item('Produto Padrão', 100)];
  }

  comUser(user) {
    this.user = user;
    return this;
  }

  comItens(itens) {
    this.itens = itens;
    return this;
  }

  vazio() {
    this.itens = [];
    return this;
  }

  build() {
    return new Carrinho(this.user, this.itens);
  }
}
