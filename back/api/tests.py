from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Cliente, Imovel


class ContratoAluguelApiTests(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='locador',
            password='senha-de-teste',
        )
        self.outro_usuario = User.objects.create_user(
            username='outro-locador',
            password='senha-de-teste',
        )
        self.cliente = Cliente.objects.create(
            usuario=self.usuario,
            nome='Inquilino',
            cpf='12345678901',
        )
        self.imovel = Imovel.objects.create(
            usuario=self.usuario,
            endereco='Rua de teste',
            numero='10',
            bairro='Centro',
            cidade_uf='São Paulo/SP',
            tipo='Casa',
        )
        self.url = reverse('contrato-list-create')
        self.client.force_authenticate(user=self.usuario)

    def payload(self, **overrides):
        data = {
            'inquilino': self.cliente.pk,
            'imovel': self.imovel.pk,
            'prazo_meses': 12,
            'valor_aluguel': 1500,
            'dia_vencimento': 10,
            'valor_caucao': 0,
            'multa_infracao': 0,
            'multa_rescisao': 0,
            'cidade_assinatura': 'São Paulo',
            'estado_assinatura': 'SP',
            'data_inicio': '2026-10-13',
            'data_assinatura': '2026-10-13',
            'sem_caucao': True,
            'sem_multa_infracao': False,
            'sem_multa_rescisao': False,
        }
        data.update(overrides)
        return data

    def test_creates_rental_contract_for_authenticated_user(self):
        response = self.client.post(self.url, self.payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['usuario'], self.usuario.pk)
        self.assertEqual(response.data['inquilino'], self.cliente.pk)
        self.assertEqual(response.data['imovel'], self.imovel.pk)

    def test_rejects_client_owned_by_another_user(self):
        cliente_alheio = Cliente.objects.create(
            usuario=self.outro_usuario,
            nome='Cliente de outro usuário',
            cpf='10987654321',
        )

        response = self.client.post(
            self.url,
            self.payload(inquilino=cliente_alheio.pk),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('inquilino', response.data)

    def test_rejects_property_owned_by_another_user(self):
        imovel_alheio = Imovel.objects.create(
            usuario=self.outro_usuario,
            endereco='Rua de outro usuário',
            numero='20',
            bairro='Centro',
            cidade_uf='São Paulo/SP',
            tipo='Apartamento',
        )

        response = self.client.post(
            self.url,
            self.payload(imovel=imovel_alheio.pk),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('imovel', response.data)
