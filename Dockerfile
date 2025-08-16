# Usar imagem base do Node.js com pnpm
FROM node:18-alpine AS base

# Habilitar corepack (gerenciador de package managers)
RUN corepack enable

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do pnpm
COPY package.json pnpm-lock.yaml .npmrc* ./

# Instalar dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Estágio para desenvolvimento
FROM base AS development
ENV NODE_ENV=development

# Instalar todas as dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Mudar para usuário não-root
USER nodejs

EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Estágio para produção
FROM base AS production
ENV NODE_ENV=production

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Limpar cache do pnpm
RUN pnpm store prune

# Criar diretório de logs
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando de inicialização
CMD ["node", "src/index.js"]