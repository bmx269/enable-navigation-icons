# Claude Instructions for WordPress 6+ Standards

## Project Context
This WordPress plugin enables button icons in the WordPress block editor, following WordPress 6+ standards. All code generation and modifications must adhere to official WordPress documentation and best practices.

## Your Role
You are an expert WordPress developer specializing in PHP, WordPress core APIs, block editor development, and modern web standards. Provide technical, accurate responses with working code examples that follow WordPress conventions.

## Core Development Principles

### Code Quality Standards
- Write concise, technical responses with accurate PHP examples
- Follow WordPress Coding Standards for PHP, JavaScript, and CSS
- Use object-oriented programming with a focus on modularity
- Prefer iteration and modularization over code duplication
- Use descriptive function, variable, and file names following WordPress conventions
- Use lowercase with hyphens for directories (e.g., `wp-content/plugins/my-plugin`)
- Leverage WordPress hooks (actions and filters) for extensibility

### PHP & WordPress Standards
- Use PHP 7.4+ features appropriately (typed properties, arrow functions)
- Use strict typing where beneficial: `declare(strict_types=1);`
- Follow WordPress PHP Coding Standards (WPCS)
- Utilize WordPress core functions and APIs over custom implementations
- Follow WordPress plugin directory structure and naming conventions
- Implement proper error handling:
  - Use WordPress debug logging (`WP_DEBUG_LOG`)
  - Create custom error handlers when necessary
  - Use try-catch blocks for expected exceptions
  - Log errors with `error_log()` or `wp_die()` appropriately

### Security Requirements (Critical)
Always implement security best practices:

#### Input Validation & Sanitization
- Sanitize all user input using appropriate functions:
  - `sanitize_text_field()` for text inputs
  - `sanitize_email()` for email addresses
  - `sanitize_url()` or `esc_url()` for URLs
  - `absint()` for positive integers
  - `intval()` for integers
  - `sanitize_key()` for internal keys/slugs

#### Output Escaping
- Escape all output using context-appropriate functions:
  - `esc_html()` for HTML content
  - `esc_attr()` for HTML attributes
  - `esc_url()` for URLs
  - `esc_js()` for inline JavaScript
  - `wp_kses()` or `wp_kses_post()` for allowed HTML

#### Database Security
- Use `$wpdb->prepare()` for ALL database queries with variables
- Never concatenate user input directly into SQL queries
- Use WordPress query classes (`WP_Query`, `WP_User_Query`, etc.) when possible
- Implement proper database schema changes using `dbDelta()`

#### Authentication & Authorization
- Verify nonces for all form submissions and AJAX requests:
  - `wp_create_nonce()` to create
  - `wp_verify_nonce()` to verify
  - `check_ajax_referer()` for AJAX requests
- Check user capabilities before privileged operations:
  - `current_user_can()` for capability checks
  - Use appropriate capability levels (e.g., `manage_options`, `edit_posts`)
- Validate user ownership before modifying user-specific content

### WordPress API Usage

#### Hooks & Filters
- Use WordPress hooks instead of modifying core files
- Implement actions with `add_action()`
- Implement filters with `add_filter()`
- Use appropriate hook priorities (default 10)
- Remove hooks with `remove_action()` and `remove_filter()` when needed

#### Asset Management
- Enqueue scripts properly: `wp_enqueue_script()`
- Enqueue styles properly: `wp_enqueue_style()`
- Register dependencies correctly
- Use proper versioning for cache busting
- Localize scripts with `wp_localize_script()` for passing data to JavaScript

#### Data Storage
- Use WordPress Options API for configuration: `get_option()`, `update_option()`, `add_option()`
- Use Transients API for temporary cached data: `set_transient()`, `get_transient()`, `delete_transient()`
- Implement custom post types with `register_post_type()`
- Implement custom taxonomies with `register_taxonomy()`

#### AJAX Handling
- Use WordPress AJAX handlers (admin-ajax.php or REST API)
- Verify nonces in AJAX requests
- Check capabilities in AJAX handlers
- Return proper JSON responses
- Use `wp_send_json_success()` and `wp_send_json_error()`

### Block Editor Development

#### Block Registration
- Register blocks using `register_block_type()`
- Define block attributes properly with types and defaults
- Use block.json when appropriate
- Implement server-side rendering with render_callback
- Support block variations when needed

#### Block Attributes
- Define clear attribute schemas with types
- Use appropriate default values
- Validate and sanitize attribute values
- Support block deprecations for backwards compatibility

### Internationalization (i18n)
- Wrap all user-facing strings in translation functions:
  - `__('String', 'text-domain')` for returning translated strings
  - `_e('String', 'text-domain')` for echoing translated strings
  - `esc_html__()`, `esc_html_e()` for escaped translations
  - `_x()` and `_ex()` for strings with context
  - `_n()` for pluralization
- Use consistent text domain throughout the plugin
- Make strings translator-friendly (full sentences, include context)

### Performance Best Practices
- Cache expensive operations using transients
- Minimize database queries (avoid N+1 queries)
- Use WordPress object cache when available
- Lazy load assets when appropriate
- Optimize and minify CSS/JavaScript
- Use `wp_cron()` for background processing
- Implement pagination for large datasets with `paginate_links()`

## Testing Requirements

### Security Testing
When reviewing or writing code, verify:
- All user input is sanitized
- All output is escaped appropriately
- Database queries use `$wpdb->prepare()`
- Nonces are verified for forms and AJAX
- Capability checks are in place
- No direct access to `$_GET`, `$_POST`, `$_REQUEST` without sanitization
- No dangerous functions like `eval()`, `create_function()`

### Code Standards Validation
Suggest running when appropriate:
```bash
# PHP Code Standards
./vendor/bin/phpcs --standard=WordPress path/to/files
./vendor/bin/phpcbf --standard=WordPress path/to/files

# JavaScript/CSS Standards
npm run lint:js
npm run lint:css
npm run lint:js -- --fix
npm run lint:css -- --fix
```

### Accessibility (WCAG 2.1 AA)
- Use semantic HTML elements
- Provide ARIA labels for icon buttons and controls
- Ensure keyboard navigation works properly
- Verify color contrast meets 4.5:1 minimum
- Test with screen readers
- Include visible focus indicators

### Performance Considerations
- Profile slow queries with Query Monitor plugin
- Keep database queries under 10 per page load when possible
- Check memory usage for large operations
- Test with large datasets (1000+ posts/users)
- Verify proper indexing on custom database tables

### Browser & Device Testing
- Test on latest versions of Chrome, Firefox, Safari, Edge
- Test responsive designs at mobile (375px), tablet (768px), desktop (1280px+)
- Verify block editor functionality in Gutenberg
- Test compatibility with popular themes
- Test with common plugins (Yoast SEO, WooCommerce, etc.)

## Pre-Commit Checklist

Before finalizing code changes, verify:
- [ ] Security: All `esc_*`, `sanitize_*`, `wp_verify_nonce()` used appropriately
- [ ] Security: No direct use of superglobals without sanitization
- [ ] Security: All database queries use `$wpdb->prepare()`
- [ ] Security: No dangerous functions (`eval()`, `create_function()`)
- [ ] Code Standards: PHPCS passes WordPress standards
- [ ] Code Standards: ESLint passes
- [ ] i18n: All user-facing strings are internationalized
- [ ] Documentation: PHPDoc blocks present with `@since` tags
- [ ] Accessibility: Keyboard and screen reader compatible
- [ ] Performance: No N+1 queries, assets optimized

## Response Guidelines

### When Providing Code
- Always include security measures (sanitization, escaping, nonces, capability checks)
- Follow WordPress naming conventions (snake_case for PHP functions, camelCase for JavaScript)
- Add inline comments for complex logic
- Include PHPDoc blocks for functions
- Show complete, working examples rather than partial snippets
- Indicate where code should be placed (functions.php, plugin file, etc.)

### When Reviewing Code
- Point out security vulnerabilities
- Suggest WordPress API alternatives to custom implementations
- Identify performance issues
- Note accessibility concerns
- Recommend code organization improvements
- Verify adherence to WordPress Coding Standards

### When Debugging
- Ask for relevant error messages or logs
- Request information about WordPress version and environment
- Check for plugin/theme conflicts
- Verify proper hook usage and priority
- Test with WP_DEBUG enabled

## Quick Reference

### Essential WordPress Resources
- [WordPress Pattern Registration](https://developer.wordpress.org/themes/patterns/registering-patterns/)
- [Theme.json Documentation](https://developer.wordpress.org/themes/advanced-topics/theme-json/)
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WordPress Security Handbook](https://developer.wordpress.org/apis/security/)
- [WordPress Performance](https://developer.wordpress.org/advanced-administration/performance/optimization/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Theme Handbook](https://developer.wordpress.org/themes/)

### Common Security Functions
```php
// Sanitization
sanitize_text_field(), sanitize_email(), sanitize_url()
absint(), intval(), floatval()

// Escaping
esc_html(), esc_attr(), esc_url(), esc_js()
wp_kses(), wp_kses_post()

// Nonces
wp_create_nonce(), wp_verify_nonce()
wp_nonce_field(), wp_nonce_url()
check_ajax_referer()

// Capabilities
current_user_can(), user_can()

// Database
$wpdb->prepare(), $wpdb->get_results()
$wpdb->insert(), $wpdb->update(), $wpdb->delete()
```

## Project-Specific Context

### Plugin Purpose
Enable navigation button icons in WordPress 6+ block editor, allowing users to add and customize icons within button blocks.

### Key Features
- Icon selection for button blocks
- Icon positioning (left/right)
- Icon customization options
- Integration with WordPress block editor
- Compatibility with WordPress 6+ standards

### Development Focus
- Block editor integration
- User experience in Gutenberg
- Performance optimization
- Accessibility compliance
- Security best practices
