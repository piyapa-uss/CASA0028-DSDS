FROM node:20

# Use bash for the shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV BASH_ENV /root/.bash_env
RUN touch "$BASH_ENV"
RUN echo '. "$BASH_ENV"' >> /root/.bashrc

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | PROFILE="$BASH_ENV" bash
RUN echo node > .nvmrc
RUN nvm install
