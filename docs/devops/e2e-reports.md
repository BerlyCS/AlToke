# Production E2E reports

`Production E2E` is a separate workflow triggered after a successful `CI / CD` run on `main`.
It never gates deployment, performs no rollback, and uses the same `:production` images with an
ephemeral PostgreSQL database and Mailpit SMTP server. The only requests sent to the real
application are read-only HTTPS smoke checks.

## Report server

Deploy `infrastructure/test-reports` on the VPS at `/home/altoke/altoke/test-reports`:

```bash
mkdir -p /home/altoke/altoke/test-reports/runs
cp infrastructure/test-reports/docker-compose.yml /home/altoke/altoke/test-reports/
cp infrastructure/test-reports/nginx.conf /home/altoke/altoke/test-reports/
cp infrastructure/test-reports/index.html /home/altoke/altoke/test-reports/
docker compose -f /home/altoke/altoke/test-reports/docker-compose.yml up -d
```

The report container joins the existing external Docker network named `nginx`. It publishes no
host port and Nginx Proxy Manager reaches it through that network.

In Nginx Proxy Manager create a Proxy Host with these values:

- Domain Names: `test.altoke.qzz.io`
- Scheme: `http`
- Forward Hostname/IP: `altoke-e2e-reports`
- Forward Port: `80`
- SSL: request a Let's Encrypt certificate, enable Force SSL and HTTP/2
- Access List: create and attach a Basic Auth user

Create an A record for `test.altoke.qzz.io` pointing at the VPS before requesting the certificate.

The workflow publishes to `/home/altoke/altoke/test-reports/runs/<date>-<sha>/` as the `altoke`
user. It keeps 30 days of runs, including the HTML report, JUnit output, screenshots, and video.

## Required GitHub secrets

- `SSH_HOST`: VPS hostname or address
- `SSH_PRIVATE_KEY`: private key authorized for the `altoke` user

Rotate any secrets that were exposed outside the VPS or GitHub Secrets before enabling this workflow.
In particular, rotate the production JWT secret, database password, Google secret, DeepSeek key,
and Brevo SMTP password. Set production `APP_BASE_URL=https://altoke.qzz.io`.
