# now-ab
This a simple HTTP proxy server to handle [Now.sh](https://now.sh) deployments AB tests.

<a href="https://www.patreon.com/sergiodxa">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## Usage
Deploy it with

```shell
now sergiodxa/now-ab
```

Now will prompt you to define 2 environment variables `TEST_A` and `TEST_B` with urls (including the protocol).

When an user access this server is going to proxy the request to one of those (doing a simple random to define which one) and will set a cookie called `now_ab` with the user test case (`TEST_A` or `TEST_B`).

You can also add more test variables to support more test cases just adding `-e TEST_C=$URL` when deploying, the server will use any variable starting with `TEST_` to get possible test cases.
