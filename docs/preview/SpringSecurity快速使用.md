---
title: SpringSecurity快速使用
createTime: 2025/03/04 09:28:52
permalink: /article/ek4lkft8/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

老版本的使用

## 使用步骤

### 1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<!--jwt-->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.7.0</version>
</dependency>
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>3.2.0</version>
</dependency>
```

### 2. 编写JWT工具类，生成token

```java
public class JWTUtils {

    /**
     * 签发JWT;这里创建的jwt
     * @param id
     * @param subject   可以是JSON数据 尽可能少
     * @param ttlMillis
     * @return
     */
    public static String createJWT(String id, String subject, long ttlMillis) {
        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        SecretKey secretKey = generalKey();  // 通过操作加密生成key
        JwtBuilder builder = Jwts.builder()
                .setId(id)
                .setSubject(subject)   // 主题
                .setIssuer("fly")       // 签发者：fly
                .setIssuedAt(now)      // 签发时间
                .signWith(signatureAlgorithm, secretKey); // 签名算法以及密匙
        if (ttlMillis >= 0) {
            long expMillis = nowMillis + ttlMillis;
            Date expDate = new Date(expMillis);
            builder.setExpiration(expDate); // 过期时间
        }
        return builder.compact();
    }

    /**
     * 生成jwt token
     *
     * @param username
     * @return
     */
    public static String createJWT(String username) {
        return createJWT(username, username, 60 * 60 * 1000); // ttlMillis表示的是一小时
    }

    /**
     * 验证JWT
     * 根据验证时抛出的超时异常、签名异常、其他异常进行一定的操作
     *
     */
    public static CheckResult validateJWT(String jwtStr) {
        CheckResult checkResult = new CheckResult();
        // 如果jwtStr为空的话，设置ErrCode为jwt不存在
        if(StringUtils.isEmpty(jwtStr)){
            checkResult.setSuccess(false);
            checkResult.setErrCode(JWTConstant.JWT_ERRCODE_NULL);
            return checkResult;
        }
        Claims claims = null;
        try {
            claims = parseJWT(jwtStr);
            checkResult.setSuccess(true);
            checkResult.setClaims(claims);
        } catch (ExpiredJwtException e) {
            checkResult.setErrCode(JWTConstant.JWT_ERRCODE_EXPIRE);
            checkResult.setSuccess(false);
        } catch (Exception e) {
            checkResult.setErrCode(JWTConstant.JWT_ERRCODE_FAIL);
            checkResult.setSuccess(false);
        }
        return checkResult;
    }

    /**
     * 生成加密Key
     *
     * @return
     */
    public static SecretKey generalKey() {
        byte[] encodedKey = Base64.decode(JWTConstant.JWT_SECRET);
        SecretKey key = new SecretKeySpec(encodedKey, 0, encodedKey.length, "AES");
        return key;
    }


    /**
     * 解析JWT字符串
     *
     * @return 返回 jwt 解析后的 payload
     */
    public static Claims parseJWT(String jwt) {
        SecretKey secretKey = generalKey();
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(jwt)
                .getBody();
    }

}
```



### 3.编写JWT验证信息

```
@Data
@NoArgsConstructor
/**
 * JWT 验证信息
 */
public class CheckResult {

    private int errCode;

    private boolean success;

    private Claims claims;

}
```

### 4. 通用类

#### 通用返回类

```java
/**
 * 通用返回类
 *
 * @param <T>
 */
@Data
public class BaseResponse<T> implements Serializable {

    private int code;

    private T data;

    private String message;

    public BaseResponse(int code, T data, String message) {
        this.code = code;
        this.data = data;
        this.message = message;
    }

    public BaseResponse(int code, T data) {
        this(code, data, "");
    }

    public BaseResponse(ErrorCode errorCode) {
        this(errorCode.getCode(), null, errorCode.getMessage());
    }
}
```

#### 通用工具类

```java

/**
 * 返回工具类
 */
public class ResultUtils {

    /**
     * 成功
     *
     * @param data
     * @param <T>
     * @return
     */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(0, data, "ok");
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode) {
        return new BaseResponse<>(errorCode);
    }

    /**
     * 失败
     *
     * @param code
     * @param message
     * @return
     */
    public static BaseResponse error(int code, String message) {
        return new BaseResponse(code, null, message);
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode, String message) {
        return new BaseResponse(errorCode.getCode(), null, message);
    }
}
```

#### 通用异常拦截

```java

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler( BusinessException.class )
    public BaseResponse<?> businessExceptionHandler(BusinessException e) {
        log.error("businessException: " + e.getMessage(), e);
        return ResultUtils.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler( RuntimeException.class )
    public BaseResponse<?> runtimeExceptionHandler(RuntimeException e) {
        log.error("runtimeException", e);
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, e.getMessage());
    }


    /**
     * @RequestBody 上校验失败后抛出的异常是 MethodArgumentNotValidException 异常。
     */
    @ExceptionHandler( value = MethodArgumentNotValidException.class )
    public BaseResponse<?> handler(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        ObjectError objectError = bindingResult.getAllErrors().stream().findFirst().get();
        log.error("实体类校验异常：-------------{}", objectError.getDefaultMessage());
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, objectError.getDefaultMessage());
    }

    /**
     * 不加 @RequestBody注解，校验失败抛出的则是 BindException
     */
    @ExceptionHandler( value = BindException.class )
    public BaseResponse<?> exceptionHandler(BindException e) {
        String messages = e.getBindingResult().getAllErrors()
                .stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("；"));
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, messages);
    }

    /**
     * @RequestParam 上校验失败后抛出的异常是 ConstraintViolationException
     */
    @ExceptionHandler( {ConstraintViolationException.class} )
    public BaseResponse<?> methodArgumentNotValid(ConstraintViolationException exception) {
        String message = exception.getConstraintViolations().stream().map(ConstraintViolation::getMessage).collect(Collectors.joining("；"));
        return ResultUtils.error(ErrorCode.PARAMS_ERROR, message);
    }

}
```



### 5. 编写config配置文件



### 6. 编写handler处理器



#### 1. 登出成功处理器

```java
/**
 * 登出成功处理器
 */
@Component
public class LogoutSuccessHandler implements org.springframework.security.web.authentication.logout.LogoutSuccessHandler {
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        ServletOutputStream outputStream = response.getOutputStream();
        outputStream.write(JSONUtil.toJsonStr(ResultUtils.success("退出成功")).getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
        outputStream.close();
    }
}
```

#### 2. 登录成功处理器（模拟）

```java
/**
 * 登陆成功处理器
 */
@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        ServletOutputStream outputStream = response.getOutputStream();
        String username = "user";
        String token = JWTUtils.createJWT(username);
        outputStream.write(JSONUtil.toJsonStr(ResultUtils.success(token)).getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
        outputStream.close();

    }
}
```

#### 3. 登录失败处理器

```java
/**
 * 登陆失败处理器
 */
@Component
public class LoginFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        ServletOutputStream outputStream = response.getOutputStream();
        String message = exception.getMessage();
        if (exception instanceof BadCredentialsException) {
            message = "用户名字或者密码错误";
        }
        outputStream.write(JSONUtil.toJsonStr(message).getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
        outputStream.close();
    }
}
```

### 7.重写UserDetailService

```java
/**
 * 自定义userDetails
 */
@Service
public class MyUserDetailServiceImpl implements UserDetailsService {
    @Resource
    private SysUserServiceImpl sysUserService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser sysUser = sysUserService.getByUserAccount(username);
        if (sysUser == null) {
            throw new UsernameNotFoundException("用户账号或密码错误");
        }
        if (sysUser.getStatus() == 1) {
            throw new BusinessException(ErrorCode.ACCOUNT_BLOCK);
        }
        return new User(sysUser.getUseraccount(), sysUser.getUserpassword(), getUserAuthority(sysUser.getUserid()));

    }

    public List<GrantedAuthority> getUserAuthority(Long userId) {
        // 格式 ROLE_admin,ROLE_user,system:user:delete,system:user:add
        String authority = sysUserService.getUserAuthorityInfo(userId);
        return AuthorityUtils.createAuthorityList(authority);
    }
}

```

### 8. JWT拦截器

```java

/**
 * jwt拦截器
 */
@Slf4j
public class  JwtAuthenticationFilter extends BasicAuthenticationFilter {

    @Resource
    private SysUserServiceImpl sysUserService;

    private static final String[] URL_WHITELIST = {
            "/api/login",
            "/api/phoneLogin",
            "/api/testLogin",
            "/api/test/test",
            "/api/sms/smsCode",
            "/api/captcha/code",
            "/api/account/userRegister",
            "/api/test/noAuth/list",
            "/doc.html",
            "/doc.html/**",
            "/doc.html#/**",
            "/v2/**",
            "/webjars/**", "/swagger-resources/**", "/v3/api-docs/**",
    };

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
        super(authenticationManager);
    }

    @Resource
    private MyUserDetailServiceImpl myUserDetailService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        String token = request.getHeader("token");
        log.info("放行URI" + request.getRequestURI());
        String requestURI = request.getRequestURI();
        // 如果token是空，url是白名单，放行
        if (StrUtil.isEmpty(token) || new ArrayList<>(Arrays.asList(URL_WHITELIST)).contains(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        CheckResult checkResult = JWTUtils.validateJWT(token);
        if (!checkResult.isSuccess()) {
            switch (checkResult.getErrCode()) {
                case JWTConstant.JWT_ERRCODE_NULL:
                    throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR, "Token 不存在");
                case JWTConstant.JWT_ERRCODE_EXPIRE:
                    throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR, "Token 已过期");
                case JWTConstant.JWT_ERRCODE_FAIL:
                    throw new BusinessException(ErrorCode.SYSTEM_ERROR, "Token 认证失败");
            }
        }
        // 解析jwt去获取用户名
        //Claims claims = checkResult.getClaims();
        Claims claims = JWTUtils.parseJWT(token);
        String userAccount = claims.getSubject();
        log.info("userAccount:" + userAccount);

        SysUser sysUser = sysUserService.getByUserAccount(userAccount);


        List<GrantedAuthority> userAuthority = myUserDetailService.getUserAuthority(sysUser.getUserid());
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userAccount, null, userAuthority);
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
        chain.doFilter(request, response);
    }
}

```



### 9. 自定义jwt异常处理

```java
/**
 * jwt认证失败处理类
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setContentType("application/json;charset=UTF-8");
        ServletOutputStream outputStream = response.getOutputStream();
        BaseResponse baseResponse = ResultUtils.error(ErrorCode.AUTHENTICATION_FAILED, "认证失败,重新登录");
        outputStream.write(JSONUtil.toJsonStr(baseResponse).getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
        outputStream.close();
    }
}
```



### 10. 获取用户角色权限

```java
@Service
@Slf4j
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser>
        implements SysUserService {

    @Resource
    private SysRoleServiceImpl sysRoleService;

    @Resource
    private SysMenuServiceImpl sysMenuService;

    @Override
    public SysUser getByUserAccount(String userAccount) {
        QueryWrapper<SysUser> queryWrapper = new QueryWrapper<SysUser>().eq("userAccount", userAccount);
        SysUser sysUser = this.getOne(queryWrapper);
        return sysUser;
    }

    @Override
    public String getUserAuthorityInfo(Long userId) {
        StringBuffer authority = new StringBuffer();
        // 1. 用户id获取所有的权限信息
        QueryWrapper<SysRole> sysRoleQueryWrapper = new QueryWrapper<>();
        List<SysRole> roleList = sysRoleService
                .list(sysRoleQueryWrapper
                        .inSql("id", "select role_id from sys_user_role where user_id=" + userId));
        if (!roleList.isEmpty()) {
            String roleCodeStrs = roleList.stream().map(r -> "ROLE_" + r.getCode()).collect(Collectors.joining(","));
            authority.append(roleCodeStrs);
        }
        // 2. 遍历角色获取所有的菜单权限
        Set<String> menuCodeSet = new HashSet<>();
        for (SysRole sysRole : roleList) {
            List<SysMenu> sysMenuList = sysMenuService
                    .list(new QueryWrapper<SysMenu>()
                            .inSql("id", "select menu_id from sys_role_menu where role_id=" + sysRole.getId()));
            for (SysMenu sysMenu : sysMenuList) {
                String perms = sysMenu.getPerms();
                if (StringUtils.isNoneEmpty(perms)) {
                    menuCodeSet.add(perms);
                }
            }
        }

        if (!menuCodeSet.isEmpty()) {
            StringBuffer menuCodeStrs = authority.append(",").append(String.join(",", menuCodeSet));
            authority.append(menuCodeStrs);
        }

        log.info(authority.toString());

        return authority.toString();
    }
}
```

### 11. 分级菜单

