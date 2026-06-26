FROM node:18-alpine
WORKDIR /app
# 腾讯npm加速源
RUN npm config set registry https://mirrors.tencent.com/npm/
# 先拷依赖文件 → install → 再拷代码（利用缓存）
COPY package*.json ./
RUN npm install --production
COPY . .
# 上海时区
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone
EXPOSE 3000
CMD ["node", "index.js"]
