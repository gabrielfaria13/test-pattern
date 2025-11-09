import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';
import { CheckoutService } from '../src/services/CheckoutService.js';

describe('quando o pagamento falha', () => {
  test('retorna null e não salva nem envia email', async () => {
    // Arrange
    const carrinho = new CarrinhoBuilder().build();

    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
    const repositoryDummy = { salvar: jest.fn() };
    const emailDummy = { enviarEmail: jest.fn() };

    const checkout = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

    // Act
    const pedido = await checkout.processarPedido(carrinho, { numero: '0000-0000' });

    // Assert
    expect(pedido).toBeNull();
    expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
    expect(repositoryDummy.salvar).not.toHaveBeenCalled();
    expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
  });
});

describe('quando um cliente Premium finaliza a compra', () => {
  test('aplica desconto de 10%, cobra o valor correto, salva e envia email', async () => {
    // Arrange
    const userPremium = UserMother.umUsuarioPremium();
    const item = { nome: 'Produto Caro', preco: 200 };
    const carrinho = new CarrinhoBuilder().comUser(userPremium).comItens([item]).build();

    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };

    const pedidoSalvo = { id: 42, carrinho, totalFinal: 180, status: 'PROCESSADO' };
    const repositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };

    const emailMock = { enviarEmail: jest.fn().mockResolvedValue(true) };

    const checkout = new CheckoutService(gatewayStub, repositoryStub, emailMock);

    // Act
    const pedido = await checkout.processarPedido(carrinho, { numero: '1111-2222' });

    // Assert
    expect(pedido).toEqual(pedidoSalvo);
    // Verifica que o valor cobrado aplica desconto de 10% sobre 200 -> 180
    expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, { numero: '1111-2222' });

    expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
    expect(emailMock.enviarEmail).toHaveBeenCalledWith(
      userPremium.email,
      'Seu Pedido foi Aprovado!',
      `Pedido ${pedidoSalvo.id} no valor de R$${pedidoSalvo.totalFinal}`
    );
  });
});
