# Mobile - Gerador de Contratos

Aplicativo React Native criado como um projeto separado para consumir a mesma API Django já usada pelo frontend web.

## Estrutura

```text
mobile/
├── App.tsx
├── app.json
├── babel.config.js
├── package.json
├── tsconfig.json
└── src/
    ├── components/
    ├── config/
    ├── context/
    ├── navigation/
    ├── screens/
    ├── services/
    ├── theme/
    └── utils/
```

## URL da API

O app usa a variável `EXPO_PUBLIC_API_URL` para apontar para o backend.

### Desenvolvimento local

Crie um arquivo `.env` na pasta `mobile/` baseado em `.env.example`.

Exemplos:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

Use `10.0.2.2` se estiver testando no emulador Android e o Django estiver rodando na máquina local.
Se estiver no iOS Simulator, normalmente `http://localhost:8000` funciona.
Em um celular físico, use o IP da sua máquina na rede local, por exemplo `http://192.168.0.10:8000`.

### Produção

Altere a variável para a URL pública da API, por exemplo:

```env
EXPO_PUBLIC_API_URL=https://api.seudominio.com
```

## Instalação

Dentro da pasta `mobile/`:

```bash
npm install
```

Se preferir usar o fluxo recomendado do Expo para garantir as versões corretas de dependências nativas, instale com:

```bash
npx expo install expo-secure-store expo-status-bar react-native-gesture-handler react-native-safe-area-context react-native-screens
npm install axios @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @expo/vector-icons
```

## Execução

Se estiver testando no iPhone físico e o túnel falhar, use LAN na mesma rede Wi-Fi:

```bash
npm run start:lan
```

```bash
npm run start
```

Use o túnel apenas se você realmente precisar acessar a máquina fora da rede local e o ngrok estiver disponível:

```bash
npm run start:tunnel
```

Comandos úteis:

```bash
npm run android
npm run ios
npm run start:clear
npm run web
```

Se o app abrir mas os dados da API não carregarem no iPhone físico, confirme que `EXPO_PUBLIC_API_URL` aponta para o IP da sua máquina na rede local, não para `localhost`.

## Fluxo de integração

```text
React Native (Mobile)
  -> API Django/Python
  -> Banco SQL/MySQL
```

O app consome os mesmos endpoints de autenticação, perfil, clientes, imóveis e contratos já existentes no backend.
